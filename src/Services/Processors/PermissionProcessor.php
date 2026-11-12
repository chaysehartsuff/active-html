<?php

namespace ChayseHartsuff\ActiveHtml\Services\Processors;

use ChayseHartsuff\ActiveHtml\Services\Processors\BaseProcessor;
use ChayseHartsuff\ActiveHtml\Enum\Action;
use Blaspsoft\Blasp\Facades\Blasp;
use Illuminate\Support\Facades\Auth;

/**
 * 
 * Ensures object is always associated with authed user
 */
class PermissionProcessor extends BaseProcessor {

    public function run(){

    }
}