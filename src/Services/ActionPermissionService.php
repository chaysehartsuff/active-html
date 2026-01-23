<?php

namespace ChayseHartsuff\ActiveHtml\Services;

use Illuminate\Database\Eloquent\Model;

class ActionPermissionService {

    /**
     * Checks permission for assigned model action.
     * 
     * @param string $action
     * @param string|Model $model
     * @return boolean
     */
    static public function canAccess($action, $model)
    {
        $permissions = config('active-html.action_permissions', []);

        if($model instanceof Model){
            $model = get_class($model);
        }

        $access = false;
        if (isset($permissions[$model])) {
            $perms_for_model = $permissions[$model];

            if(!is_array($perms_for_model)) {
                $perms_for_model = [$perms_for_model];
            }
            $highest_priority = 0;
            foreach($perms_for_model as $permission){
                $permission = new $permission();
                if(!$permission instanceof \ChayseHartsuff\ActiveHtml\Services\Permissions\BaseAll){
                    throw new \Exception('Permission for model '.$model.' must be instance of ChayseHartsuff\ActiveHtml\Services\Permissions\BaseAll');
                }
                # Compare priorites to find access permission
                if($permission::PRIORITY > $highest_priority){
                    $highest_priority = $permission::PRIORITY;
                    $access = $permission($action);
                }
                # Ensure true permissions override false on same priority
                else if($permission::PRIORITY == $highest_priority){
                    if($permission($action)){
                        $access = true;
                    }
                }
            }
        }

        return $access;
    }
}