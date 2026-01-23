<?php

namespace ChayseHartsuff\ActiveHtml\Services\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Baseline filter for all filters to extend from
 * Must implement __invoke method to apply the filter.
 */
class BaseFilter {

    /**
     * Modifies query with custom filter
     * 
     * @param string $action
     * @param Builder<Model> $query
     */
    static public function query($action, $query){
        // Apply any custom logic to filter the query here.
        return $query;
    }

    /**
     * Modifies model properties with custom processing
     * @param string $action
     * @param Model $model
     */
    static public function model($action, $model){
        return $model;
    }
}