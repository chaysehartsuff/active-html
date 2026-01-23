<?php

namespace ChayseHartsuff\ActiveHtml\Services\Permissions;

/**
 * The base permission that allows all actions.
 */
class BaseAll {
    const PRIORITY = 0;
    /**
     * Allows all actions.
     * 
     * @param string $action
     * @return boolean
     */
    public function __invoke($action){
        return true;
    }
}