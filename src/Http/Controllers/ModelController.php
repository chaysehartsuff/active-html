<?php

namespace ChayseHartsuff\ActiveHtml\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Routing\Controller as BaseController;
use ChayseHartsuff\ActiveHtml\Services\ActionFilterService;
use ChayseHartsuff\ActiveHtml\Services\ActionPermissionService;
use ChayseHartsuff\ActiveHtml\Services\ActionProcessService;
use ChayseHartsuff\ActiveHtml\Services\Processors\BaseProcessor;
use ChayseHartsuff\ActiveHtml\Enum\Action;

class ModelController extends BaseController {
    public function index(Request $request, $action) {
        /**
         * @var Model $model
         */
        $model = null; 
        /**
         * @var Model[] $models
         */
        $models = [];
        $activeModels = config('active-html.models', []);

        $request->validate([
            'model' => function ($attribute, $value, $fail) use ($activeModels, &$model) {
                if (!isset($value['active_class'])) {
                    $fail('The model must have an active_class property.');
                    return;
                }

                foreach ($activeModels as $activeModelClass) {
                    if (class_basename($activeModelClass) === $value['active_class']) {
                        // Found a valid model, instantiate and fill it
                        $model = new $activeModelClass();
                        $model->fill($value);
                        return; // Exit validation successfully
                    }
                }

                $fail('The provided model type is not supported.');
            },
            'models' => [
                'array',
                function ($attribute, $value, $fail) use ($activeModels, &$models) {
                    foreach ($value as $index => $modelData) {
                        if (!isset($modelData['active_class'])) {
                            $fail("Model at index {$index} must have an active_class property.");
                            return;
                        }

                        $foundModel = false;
                        foreach ($activeModels as $activeModelClass) {
                            if (class_basename($activeModelClass) === $modelData['active_class']) {
                                // Found a valid model, instantiate, fill, and add to array
                                $instance = new $activeModelClass();
                                $instance->fill($modelData);
                                $models[] = $instance;
                                $foundModel = true;
                                break; // Move to the next model in the request
                            }
                        }

                        if (!$foundModel) {
                            $fail("The model type '{$modelData['active_class']}' at index {$index} is not supported.");
                            return;
                        }
                    }
                }
            ],
        ]);

        $query = $model::query();

        # Check Permissions
        if(!ActionPermissionService::canAccess($action, $model)) {
            return response()->json(['message' => 'You do not have permission to access this action.'], 403);
        }

        $aps = new ActionProcessService();
        $response = $aps
            ->runLast(BaseProcessor::class)
            ->run($action, $model, $models, $query);

        return response()->json($response);
    }
}