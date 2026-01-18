<?php

namespace ChayseHartsuff\ActiveHtml\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Routing\Controller as BaseController;

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

        // At this point, $model or $models will be populated with initialized Eloquent objects
        // if the corresponding data was in the request.

        switch ($action) {
            case 'get':
                // Find a single model by its ID and return it.
                $query = $model::query();

                // If user_id exists, scope the query to the authenticated user.
                if (Schema::hasColumn($model->getTable(), 'user_id')) {
                    $query->where('user_id', Auth::id());
                }

                $foundModel = $query->find($model->id);

                if (!$foundModel) {
                    return response()->json(['message' => 'Record not found or you do not have permission to access it.'], 404);
                }

                return response()->json($foundModel);

            case 'getAll':
                // The 'model' object from validation tells us which class to use.
                $query = $model::query();

                // If user_id exists, scope the query to the authenticated user.
                if (Schema::hasColumn($model->getTable(), 'user_id')) {
                    $query->where('user_id', Auth::id());
                }

                return response()->json($query->get());

            case 'create':
                // The model is already filled from validation.
                // If user_id exists, associate the new record with the authenticated user.
                if (Schema::hasColumn($model->getTable(), 'user_id')) {
                    $model->user_id = Auth::id();
                }
                $model->save();
                return response()->json($model, 201);

            case 'createAll':
                $createdRecords = [];
                foreach ($models as $modelToCreate) {
                    // If user_id exists, associate the new record with the authenticated user.
                    if (Schema::hasColumn($modelToCreate->getTable(), 'user_id')) {
                        $modelToCreate->user_id = Auth::id();
                    }
                    $modelToCreate->save();
                    $createdRecords[] = $modelToCreate;
                }
                return response()->json($createdRecords, 201);

            case 'update':
                // Find the existing record, fill it with new data, and save.
                $query = $model::query();

                // If user_id exists, scope the query to the authenticated user.
                if (Schema::hasColumn($model->getTable(), 'user_id')) {
                    $query->where('user_id', Auth::id());
                }

                $recordToUpdate = $query->find($model->id);

                if ($recordToUpdate) {
                    $recordToUpdate->fill($model->getAttributes());
                    $recordToUpdate->save();
                    return response()->json($recordToUpdate);
                }
                return response()->json(['message' => 'Record not found or you do not have permission to update it.'], 404);

            case 'updateAll':
                // Iterate through the models from the request, find each one, and update it.
                $updatedRecords = [];
                foreach ($models as $modelToUpdate) {
                    $query = $modelToUpdate::query();

                    // If user_id exists, scope the query to the authenticated user.
                    if (Schema::hasColumn($modelToUpdate->getTable(), 'user_id')) {
                        $query->where('user_id', Auth::id());
                    }

                    $record = $query->find($modelToUpdate->id);

                    if ($record) {
                        $record->fill($modelToUpdate->getAttributes());
                        $record->save();
                        $updatedRecords[] = $record;
                    }
                }
                return response()->json($updatedRecords);

            case 'delete':
                // Find the record by ID and delete it.
                $query = $model::query();

                // If user_id exists, scope the query to the authenticated user.
                if (Schema::hasColumn($model->getTable(), 'user_id')) {
                    $query->where('user_id', Auth::id());
                }

                $recordToDelete = $query->find($model->id);

                if ($recordToDelete) {
                    $recordToDelete->delete();
                    return response()->json(['message' => 'Record deleted successfully.']);
                }
                return response()->json(['message' => 'Record not found or you do not have permission to delete it.'], 404);

            case 'deleteAll':
                // Get the class from the first model, then collect all IDs to delete.
                if (empty($models)) {
                    return response()->json(['message' => 'No models provided for deletion.'], 400);
                }
                $modelClass = get_class($models[0]);
                $modelInstance = new $modelClass();
                $idsToDelete = array_map(fn($m) => $m->id, $models);

                $query = $modelClass::query()->whereIn('id', $idsToDelete);

                // If user_id exists, scope the query to the authenticated user.
                if (Schema::hasColumn($modelInstance->getTable(), 'user_id')) {
                    $query->where('user_id', Auth::id());
                }

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