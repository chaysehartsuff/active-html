<?php

namespace ChayseHartsuff\ActiveHtml\Services\Permissions;

use ChayseHartsuff\ActiveHtml\Enum\Action;

class Edit extends BaseAll {

    /**
     * Allows update actions.
     * 
     * @param string $action
     * @return boolean
     */
    public function __invoke($action){
        if($action === Action::UPDATE || $action === Action::UPDATE_ALL){
            return true;
        }
        return false;
    }
}