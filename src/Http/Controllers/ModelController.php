<?php

namespace ChayseHartsuff\ActiveHtml\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Routing\Controller as BaseController;
use ChayseHartsuff\ActiveHtml\Services\ActionFilterService;
use ChayseHartsuff\ActiveHtml\Services\ActionPermissionService;
use ChayseHartsuff\ActiveHtml\Enum\Action;

class ModelController extends BaseController {
    public function index(Request $request, $action) {
    \Log::info('ModelController.index called', [
        'action' => $action,
        'auth_check' => Auth::check(),
        'auth_id' => Auth::id(),
        'session_id' => session()->getId(),
        'cookies' => $request->cookies->all(),
        'headers' => $request->headers->all(),
        'user' => Auth::user(),
    ]);
        /**
         * @var Model $model
         */
        $model = null; 
        /**
         * @var Model[] $models
         */
        $models = [];
        $activeModels = config('active-html.models', []);

        if(Auth::check()){
            $tightass = 0;
        }

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

        switch ($action) {
            case Action::GET:
                $query = ActionFilterService::applyQuery($action, $model, $query);
                $foundModel = $query->find($model->id);
                $foundModel = ActionFilterService::applyModel($action, $foundModel);

                if (!$foundModel) {
                    return response()->json(['message' => 'Record not found or you do not have permission to access it.'], 404);
                }
                
                return response()->json($foundModel);

            case Action::GET_ALL:
                $query = ActionFilterService::applyQuery($action, $model, $query);
                $models = $query->get();
                for ($i = 0; $i < count($models); $i++) {
                    $models[$i] = ActionFilterService::applyModel($action, $models[$i]);
                }
                return response()->json($models);

            case Action::CREATE:
                $model = ActionFilterService::applyModel($action, $model);
                $model->save();
                return response()->json($model, 201);

            case Action::CREATE_ALL:
                $createdRecords = [];
                foreach ($models as $modelToCreate) {
                    $modelToCreate = ActionFilterService::applyModel($action, $modelToCreate);
                    $modelToCreate->save();
                    $createdRecords[] = $modelToCreate;
                }
                return response()->json($createdRecords, 201);

            case Action::UPDATE:
                $query = ActionFilterService::applyQuery($action, $model, $query);
                $recordToUpdate = $query->find($model->id);

                if ($recordToUpdate) {
                    $recordToUpdate->fill($model->getAttributes());
                    $recordToUpdate = ActionFilterService::applyModel($action, $recordToUpdate);
                    $recordToUpdate->save();
                    return response()->json($recordToUpdate);
                }
                return response()->json(['message' => 'Record not found or you do not have permission to update it.'], 404);

            case Action::UPDATE_ALL:
                // Iterate through the models from the request, find each one, and update it.
                $updatedRecords = [];
                foreach ($models as $modelToUpdate) {
                    $query = $modelToUpdate::query();
                    $query = ActionFilterService::applyQuery($action, $modelToUpdate, $query);

                    $record = $query->find($modelToUpdate->id);

                    if ($record) {
                        $record->fill($modelToUpdate->getAttributes());
                        $record = ActionFilterService::applyModel($action, $record);
                        $record->save();
                        $updatedRecords[] = $record;
                    }
                }
                return response()->json($updatedRecords);

            case Action::DELETE:
                $query = ActionFilterService::applyQuery($action, $model, $query);
                $recordToDelete = $query->find($model->id);

                if ($recordToDelete) {
                    $recordToDelete = ActionFilterService::applyModel($action, $recordToDelete);
                    $recordToDelete->delete();
                    return response()->json(['message' => 'Record deleted successfully.']);
                }
                return response()->json(['message' => 'Record not found or you do not have permission to delete it.'], 404);

            case Action::DELETE_ALL:
                // Get the class from the first model, then collect all IDs to delete.
                if (empty($models)) {
                    return response()->json(['message' => 'No models provided for deletion.'], 400);
                }
                $modelClass = get_class($models[0]);
                $modelInstance = new $modelClass();
                $idsToDelete = array_map(fn($m) => $m->id, $models);

                $query = $modelClass::query()->whereIn('id', $idsToDelete);
                $query = ActionFilterService::applyQuery($action, $modelInstance, $query);

                $deletedCount = $query->delete();

                return response()->json(['message' => "Deleted {$deletedCount} records."]);
        }

        // Temporary response for testing
        return response()->json([
            'message' => 'Validation passed. Action: ' . $action,
            'model' => $model,
            'models' => $models
        ]);
    }
}