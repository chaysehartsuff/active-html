<?php

namespace ChayseHartsuff\ActiveHtml\Services\Permissions;

use ChayseHartsuff\ActiveHtml\Enum\Action;

class Delete extends BaseAll {
    /**
     * Allows delete actions.
     * 
     * @param string $action
     * @return boolean
     */
    public function __invoke($action){
        if($action === Action::DELETE || $action === Action::DELETE_ALL){
            return true;
        }
        return false;
    }
}