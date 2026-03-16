<?php

namespace ChayseHartsuff\ActiveHtml\Services\Processors;

use ChayseHartsuff\ActiveHtml\Enum\Action;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class BaseProcessor {
    /**
     * @var Model $_model
     */
    private $_model;
    /**
     * @var  Model[] $_models
     */
    private $_models = [];
    /**
     * @var \Illuminate\Database\Eloquent\Builder $_query
     */
    private $_query;
    /**
     * @var string $_action
     */
    private $_action;
    /**
     * @var array $_errors
     */
    private $_errors = [];
    private $_response = [];
    /**
     * The base processor that does nothing.
     * 
     * @param Model $model
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $action
     * @return BaseProcessor
     */
    public function __invoke($model, $models, $query, $action, $response = []){
        $this->_model = $model;
        $this->_models = $models;
        $this->_query = $query;
        $this->_action = $action;
        $this->_response = $response;
        $this->run();
        return $this;
    }

    protected function run(){
        $query = $this->getQuery();
        $model = $this->getModel();
        switch ($this->getAction()){
            case Action::GET:
                $this->setModel($query->first($model->id));
                break;
            case Action::GET_ALL:
                $this->setModels($query->get());
                break;
            case Action::UPDATE:
            case Action::CREATE:
                $model->save();
                $model->refresh();
                $this->setModel($model);
                break;
            case Action::UPDATE_ALL:
            case Action::CREATE_ALL:
                $modelsToSave = [];
                foreach ($this->getModels() as $modelToCreate) {
                    $modelToCreate->save();
                    $modelToCreate->refresh();
                    $modelsToSave[] = $modelToCreate;
                }
                $this->setModels($modelsToSave);
                break;
            case Action::DELETE:
                $this->setResponse('deleted', $model->delete());
                break;
            case Action::DELETE_ALL:
                $deletedCount = 0;
                foreach ($this->getModels() as $modelToDelete) {
                    $deletedCount += $modelToDelete->delete();
                }
                $this->setResponse('deleted', $deletedCount);
                break;
        }   
    }
    /**
     * Validates the model against the given rules and stores any errors.
     * Rules are defined exactly like standard Laravel validation rules.
     *
     * @param mixed $rules
     * @return void
     */
    protected function validate($rules = []){
        $data = [];

        foreach (array_keys($rules) as $field) {
            $data[$field] = data_get($this->_model, $field);
        }

        $validator = Validator::make($data, $rules);

        $this->_errors = $validator->fails()
            ? $validator->errors()->toArray()
            : [];
    }
    /**
     * Checks if current action matches a certain type
     * @param string $action
     * @return bool
     */
    protected function isAction($action){
        return $this->_action === $action;
    }
    /**
     * Appends to response
     * 
     * @param string $key
     * @param mixed $value
     * @return void
     */
    protected function setResponse($key, $value){
        $this->_response[$key] = $value;
    }

    public function getModel(){
        return $this->_model;
    }
    /**
     * Sets the model for the processor.
     * 
     * @param Model $model
     * @return void
     */
    public function setModel($model){
        $this->_model = $model;
    }
    public function getModels(){
        return $this->_models;
    }
    public function setModels($models){
        $this->_models = $models;
    }

    public function getQuery(){
        return $this->_query;
    }
    public function setQuery($query){
        $this->_query = $query;
    }

    public function getAction(){
        return $this->_action;
    }

    public function getErrors(){
        return $this->_errors;
    }

    public function getResponse(){
        return [
            ...$this->_response,
            'model' => $this->_model,
            'models' => $this->_models,
            'errors' => $this->_errors
        ];
    }
}