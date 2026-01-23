<?php

namespace ChayseHartsuff\ActiveHtml\Services\Permissions;

use ChayseHartsuff\ActiveHtml\Enum\Action;

class Write extends BaseAll {

    /**
     * Allows create actions.
     * 
     * @param string $action
     * @return boolean
     */
    public function __invoke($action){
        if($action === Action::CREATE || $action === Action::CREATE_ALL){
            return true;
        }
        return false;
    }
}