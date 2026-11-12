<?php

namespace ChayseHartsuff\ActiveHtml\Services\Processors;

use Illuminate\Database\Eloquent\Model;
use ChayseHartsuff\ActiveHtml\Services\Processors\BaseProcessor;


/**
 * 
 * Ensures object is always associated with authed user
 */
class TableProcessor extends BaseProcessor {

    const ACTION_GET_PAGINATION = 'getPagination';

    protected $additional_columns = [];

    public function run(){
        if($this->getAction() === self::ACTION_GET_PAGINATION){
            $query = $this->getQuery();
            $request = request()->all();
            $this->validate([
                'filter_options' => ['required', 'array'],
                'filter_options.page' => ['required', 'numeric'],
                'filter_options.items_per_page' => ['numeric'],
                'filter_options.columns' => ['array'],
                'filter_options.columns.*.key' => ['required', 'string'],
                'filter_options.columns.*.value' => ['nullable'],
                'filter_options.columns.*.between_value' => ['string'], // Optional: acts an additional value for range filters, e.g. "between" operator
                'filter_options.sort_columns' => ['array'],
                'filter_options.sort_columns.*.key' => ['required', 'string'],
                'filter_options.sort_columns.*.direction' => ['required', 'in:asc,desc'],
                'columns.*.name' => ['string'],
            ], [], [], $request);

            $filterOptions = $request['filter_options'];
            $itemsPerPage = $filterOptions['items_per_page'] ?? 10;
            $page = $filterOptions['page'];

            # Apply filters
            $columns = $request['columns'] ?? ['*'];
            if (!empty($this->additional_columns) && $columns !== ['*']) {
                $columns = array_values(array_filter($columns, function ($column) {
                    return !array_key_exists($column, $this->additional_columns);
                }));
            }
            $filterColumns = $filterOptions['columns'] ?? [];
            $queryFilterColumns = array_values(array_filter($filterColumns, function ($column) {
                $columnKey = $column['key'] ?? null;

                if ($columnKey === null || $columnKey === '*') {
                    return false;
                }

                # Skip additional columns
                return !isset($this->additional_columns[$columnKey]);
            }));

            if (!empty($queryFilterColumns)) {
                # Group OR filters so they are appended safely to the existing query:
                # existing_where_1 AND existing_where_2 AND (filter_1 OR filter_2 OR ...)
                $query->where(function ($filterQuery) use ($queryFilterColumns) {
                    foreach ($queryFilterColumns as $index => $column) {
                        $key = $column['key'];
                        $value = $column['value'] ?? '';
                        $isOrCondition = $index > 0;

                        if (is_string($value)) {
                            if (isset($column['between_value'])) {
                                if ($isOrCondition) {
                                    $filterQuery->orWhereBetween($key, [$value, $column['between_value']]);
                                } else {
                                    $filterQuery->whereBetween($key, [$value, $column['between_value']]);
                                }
                            } else {
                                if ($isOrCondition) {
                                    $filterQuery->orWhere($key, 'like', "%{$value}%");
                                } else {
                                    $filterQuery->where($key, 'like', "%{$value}%");
                                }
                            }
                        } else {
                            if ($isOrCondition) {
                                $filterQuery->orWhere($key, $value);
                            } else {
                                $filterQuery->where($key, $value);
                            }
                        }
                    }
                });
            }
            # Apply sorting
            $sortColumns = $filterOptions['sort_columns'] ?? [];
            foreach($sortColumns as $sortColumn){
                $key = $sortColumn['key'];
                $direction = $sortColumn['direction'];

                # Additional columns are computed later and cannot be sorted at query level.
                if (isset($this->additional_columns[$key])) {
                    continue;
                }

                $query->orderBy($key, $direction);
            }

            $additionalSortColumns = array_values(array_filter($sortColumns, function ($sortColumn) {
                $key = $sortColumn['key'] ?? null;
                return $key !== null && isset($this->additional_columns[$key]);
            }));

            # For additional-column sorting, compute/sort the entire filtered result set first,
            # then paginate the sorted collection so ordering is consistent across pages.
            if (!empty($additionalSortColumns)) {
                $allResults = $query->get($columns);

                $remove_rows = [];
                if(!empty($this->additional_columns)){
                    foreach($this->additional_columns as $key => $additionalColumn){
                        $allResults->transform(function ($row) use ($additionalColumn, $key, &$remove_rows) {
                            $filter = [];
                            foreach(request()->input('filter_options.columns', []) as $filterColumn){
                                if($filterColumn['key'] === $key){
                                    $filter['value'] = $filterColumn['value'];
                                    if (isset($filterColumn['between_value'])) {
                                        $filter['between_value'] = $filterColumn['between_value'];
                                    }
                                    break;
                                }
                            }
                            $processedValue = $this->processAdditionalColumn($row, $key, $filter);
                            if ($processedValue === null) {
                                $rowId = is_array($row) ? ($row['id'] ?? null) : ($row->id ?? null);
                                if ($rowId !== null) {
                                    $remove_rows[] = $rowId;
                                }
                                return $row;
                            }
                            if (is_array($row)) {
                                $row[$key] = $processedValue;
                                return $row;
                            }

                            if ($row instanceof Model) {
                                $row->setAttribute($key, $processedValue);
                            } elseif (is_object($row)) {
                                $row->{$key} = $processedValue;
                            }
                            return $row;
                        });
                    }
                }

                $remove_rows = array_values(array_unique($remove_rows));
                $filteredResults = $allResults->reject(function ($row) use ($remove_rows) {
                    $rowId = is_array($row) ? ($row['id'] ?? null) : ($row->id ?? null);
                    return $rowId !== null && in_array($rowId, $remove_rows, true);
                });

                foreach ($additionalSortColumns as $sortColumn) {
                    $key = $sortColumn['key'];
                    $direction = strtolower($sortColumn['direction'] ?? 'asc');

                    $valueResolver = function ($row) use ($key) {
                        if (is_array($row)) {
                            return $row[$key] ?? null;
                        }

                        return $row->{$key} ?? null;
                    };

                    if ($direction === 'desc') {
                        $filteredResults = $filteredResults->sortByDesc($valueResolver);
                    } else {
                        $filteredResults = $filteredResults->sortBy($valueResolver);
                    }
                }

                $filteredResults = $filteredResults->values();
                $totalFiltered = $filteredResults->count();
                $offset = max(0, ($page - 1) * $itemsPerPage);
                $pagedResults = $filteredResults->slice($offset, $itemsPerPage)->values();

                $this->setResponse('total', $totalFiltered);
                $this->setModels($pagedResults->all());
                return;
            }

            $paginatedResults = $query->paginate($itemsPerPage, $columns, 'page', $page);
            # Process additional columns
            $remove_rows = [];
            if(!empty($this->additional_columns)){
                foreach($this->additional_columns as $key => $additionalColumn){
                    $paginatedResults->getCollection()->transform(function ($row) use ($additionalColumn, $key, &$remove_rows) {
                        $filter = [];
                        foreach(request()->input('filter_options.columns', []) as $filterColumn){
                            if($filterColumn['key'] === $key){
                                $filter['value'] = $filterColumn['value'];
                                if (isset($filterColumn['between_value'])) {
                                    $filter['between_value'] = $filterColumn['between_value'];
                                }
                                break;
                            }
                        }
                        # Remove row if addtional column can't be processed
                        # This creates an assumption that only valid connecting rows will exist in the results
                        $processedValue = $this->processAdditionalColumn($row, $key, $filter);
                        if ($processedValue === null) { 
                            $rowId = is_array($row) ? ($row['id'] ?? null) : ($row->id ?? null);
                            if ($rowId !== null) {
                                $remove_rows[] = $rowId;
                            }
                            return $row;
                        }
                        if (is_array($row)) {
                            $row[$key] = $processedValue;
                            return $row;
                        }

                        if ($row instanceof Model) {
                            $row->setAttribute($key, $processedValue);
                        } elseif (is_object($row)) {
                            $row->{$key} = $processedValue;
                        }
                        return $row;
                    });
                }
            }

            $remove_rows = array_values(array_unique($remove_rows));
            $filteredResults = $paginatedResults->getCollection()->reject(function ($row) use ($remove_rows) {
                $rowId = is_array($row) ? ($row['id'] ?? null) : ($row->id ?? null);
                return $rowId !== null && in_array($rowId, $remove_rows, true);
            });

            $filteredResults = $filteredResults->values();

            $this->setResponse('total', $paginatedResults->total());
            $this->setModels($filteredResults->all());
        }
    }

    /**
     * Processes the value for an additional column on the given model/row instance
     * 
        * @param mixed $model
     * @param string $column_key
     * @param array $filter
     * @return mixed
     */
    protected function processAdditionalColumn($model, $column_key, $filter = []){
        return;
    }
}