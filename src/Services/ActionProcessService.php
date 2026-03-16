<?php

namespace ChayseHartsuff\ActiveHtml\Services;

use ChayseHartsuff\ActiveHtml\Services\Processors\BaseProcessor;
use Illuminate\Database\Eloquent\Model;

class ActionProcessService
{
    private $_run_first_processor;
    private $_run_before_processors = [];
    private $_run_last_processor;
    private $_run_after_processors = [];

    /**
     * Applies assigned filters to given model
     * @param string $action
     * @param Model $model
     * @param Model[] $models
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @throws \Exception
     * */
    public function run($action, $model, $models, $query)
    {
        $model_processors = config('active-html.action_processors', []);

        $modelString = get_class($model);
        $last_response = [];

        $processors = [];

        if (isset($model_processors[$modelString])) {
            $processors = $model_processors[$modelString];
            if (!is_array($processors)) {
                $processors = [$processors];
            }
        }

        if (!empty($this->_run_before_processors)) {
            $processors = array_merge($this->_run_before_processors, $processors);
        }

        if ($this->_run_first_processor) {
            array_unshift($processors, $this->_run_first_processor);
        }

        if (!empty($this->_run_after_processors)) {
            $processors = array_merge($processors, $this->_run_after_processors);
        }

        if ($this->_run_last_processor) {
            $processors[] = $this->_run_last_processor;
        }

        foreach ($processors as $processor) {
            if (is_string($processor)) {
                $processor = new $processor();
            }

            if (!$processor instanceof BaseProcessor) {
                throw new \Exception("Processor for model '{$modelString}' must be an instance of ChayseHartsuff\\ActiveHtml\\Services\\Processors\\BaseProcessor");
            }

            $result = $processor($model, $models, $query, $action, $last_response);
            $model = $result->getModel();
            $models = $result->getModels();
            $query = $result->getQuery();
            $last_response = $result->getResponse();
        }

        return $last_response;
    }

    /**
     * Runs processor as the last and final process
     * 
     * @param string $processor
     * @return ActionProcessService
     */
    public function runLast($processor){
        $this->_run_last_processor = $processor;
        return $this;
    }
    /**
     * Runs processor as the first process before any other
     * @param string $processor
     * @return ActionProcessService
     */
    public function runFirst($processor){
        $this->_run_first_processor = $processor;
        return $this;
    }

    /**
     * Runs processor after all other processes
     * @param string $processor
     * @return ActionProcessService
     */
    public function runAfter($processor){
        $this->_run_after_processors[] = $processor;
        return $this;
    }

    /**
     * Runs processor before all other processes
     * @param string $processor
     * @return ActionProcessService
     */
    public function runBefore($processor){
        $this->_run_before_processors[] = $processor;
        return $this;
    }

    public function reset(){
        $this->_run_first_processor = null;
        $this->_run_before_processors = [];
        $this->_run_last_processor = null;
        $this->_run_after_processors = [];
    }
}