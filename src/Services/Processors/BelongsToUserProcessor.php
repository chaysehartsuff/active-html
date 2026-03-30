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
class BelongsToUserProcessor extends BaseProcessor {

    public function run(){
        if(Auth::check()){
            $this->getQuery()->where('user_id', Auth::id());
        } else {
            # prevent results if not authorized
            $this->getQuery()->whereRaw('1 = 0');
        }
    }
}