<?php

namespace ChayseHartsuff\ActiveHtml\Services\Filters;
use Illuminate\Support\Facades\Auth;
use ChayseHartsuff\ActiveHtml\Services\Filters\BaseFilter;

class BelongsToUser extends BaseFilter {

    public static function query($action, $query){
        if(Auth::check()){
            $query->where('user_id', Auth::id());
        }
        return $query;
    }

    public static function model($action, $model){
        if(Auth::check()){
            $model->user_id = Auth::id();
        }
        return $model;
    }
}