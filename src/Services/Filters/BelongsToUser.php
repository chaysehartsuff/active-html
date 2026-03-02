<?php

namespace ChayseHartsuff\ActiveHtml\Services\Filters;
use Illuminate\Support\Facades\Auth;
use ChayseHartsuff\ActiveHtml\Services\Filters\BaseFilter;
use ChayseHartsuff\ActiveHtml\Enum\Action;

class BelongsToUser extends BaseFilter {

    public static function query($action, $query){
        if(Auth::check()){
            $query->where('user_id', Auth::id());
        }
        return $query;
    }

    public static function model($action, $model){
        if(Auth::check() && ($action !== Action::GET_ALL || $action !== Action::GET)){
            $model->user_id = Auth::id();
        }
        return $model;
    }
}