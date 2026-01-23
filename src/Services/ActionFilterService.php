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
        $filters = config('active-html.action_filters', []);

        if($model instanceof Model){
            $model = get_class($model);
        }

        if (isset($filters[$model])) {
            $filter = new $filters[$model]();
            if (!$filter instanceof \ChayseHartsuff\ActiveHtml\Services\Filters\BaseFilter) {
                throw new \Exception("Filter for model '{$model}' must be an instance of ChayseHartsuff\ActiveHtml\Services\Filters\BaseFilter");
            }
            return $filter->query($action, $query);
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
        $filters = config('active-html.action_filters', []);

        $modelString = get_class($model);

        if (isset($filters[$modelString])) {
            $filter = new $filters[$modelString]();
            if (!$filter instanceof \ChayseHartsuff\ActiveHtml\Services\Filters\BaseFilter) {
                throw new \Exception("Filter for model '{$modelString}' must be an instance of ChayseHartsuff\ActiveHtml\Services\Filters\BaseFilter");
            }
            return $filter->model($action, $model);
        }

        return $model;
    }
}