<?php

namespace ChayseHartsuff\ActiveHtml\Services\Processors;

use ChayseHartsuff\ActiveHtml\Services\Processors\BaseProcessor;
use ChayseHartsuff\ActiveHtml\Enum\Action;
use Blaspsoft\Blasp\Facades\Blasp;
use Illuminate\Support\Facades\Auth;

/**
 * 
 * Modifies 'get' action return user if session is authed
 */
class ActiveUserProcessor extends BaseProcessor {

    public function run(){
        if(
            Auth::check() 
            && $this->getModel() instanceof \App\Models\User 
            && $this->isAction(Action::GET)
            && empty($this->getModel()->id)
        ){
            $this->getModel()->id = Auth::id();
        }
    }
}