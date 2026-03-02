<?php

namespace ChayseHartsuff\ActiveHtml\Services;

use Illuminate\Database\Eloquent\Model;

class ActionFilterService
{
    /**
     * Applies assigned filters to given query
     * @param string $action
     * @param string|Model $model
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @throws \Exception
     * @return \Illuminate\Database\Eloquent\Builder
     */
    static public function applyQuery($action, $model, $query)
    {
        $model_filters = config('active-html.action_filters', []);

        if($model instanceof Model){
            $model = get_class($model);
        }

        if (isset($model_filters[$model])) {
            $filters = $model_filters[$model];
            if(!is_array($filters)){
                $filters = [$filters];
            }
            foreach($filters as $filter) {
                $filter = new $filter();
                if (!$filter instanceof \ChayseHartsuff\ActiveHtml\Services\Filters\BaseFilter) {
                    throw new \Exception("Filter for model '{$model}' must be an instance of ChayseHartsuff\ActiveHtml\Services\Filters\BaseFilter");
                }
                return $filter->query($action, $query);
            }
        }

        return $query;
    }

    /**
     * Applies assigned filters to given model
     * @param string $action
     * @param Model $model
     * @throws \Exception
     * @return mixed
     * */
    static public function applyModel($action, $model)
    {
        $model_filters = config('active-html.action_filters', []);

        $modelString = get_class($model);

        if (isset($model_filters[$modelString])) {
            $filters = $model_filters[$modelString];
            if(!is_array($filters)){
                $filters = [$filters];
            }
            foreach ($filters as $filter) {
                $filter = new $filter();
                if (!$filter instanceof \ChayseHartsuff\ActiveHtml\Services\Filters\BaseFilter) {
                    throw new \Exception("Filter for model '{$modelString}' must be an instance of ChayseHartsuff\ActiveHtml\Services\Filters\BaseFilter");
                }
                $model = $filter->model($action, $model);
            }
        }

        return $model;
    }
}