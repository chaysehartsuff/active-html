<?php

namespace ChayseHartsuff\ActiveHtml\Services\Permissions;

use ChayseHartsuff\ActiveHtml\Enum\Action;

class Read extends BaseAll {

    /**
     * Allows get actions.
     * 
     * @param string $action
     * @return boolean
     */
    public function __invoke($action){
        if($action === Action::GET || $action === Action::GET_ALL){
            return true;
        }
        return false;
    }
}