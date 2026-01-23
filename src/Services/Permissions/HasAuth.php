<?php

namespace ChayseHartsuff\ActiveHtml\Services\Permissions;

use ChayseHartsuff\ActiveHtml\Enum\Action;
use Auth;

class HasAuth extends BaseAll {
    const PRIORITY = 10;
    /**
     * Allows all actions.
     * 
     * @param string $action
     * @return boolean
     */
    public function __invoke($action){
        if(Auth::check()){
            return true;
        }
        return false;
    }
}