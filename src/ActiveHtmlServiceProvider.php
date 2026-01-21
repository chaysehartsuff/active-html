<?php

namespace ChayseHartsuff\ActiveHtml;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class ActiveHtmlServiceProvider extends ServiceProvider
{
    public function register()
    {
        // Merge config
        $this->mergeConfigFrom(
            __DIR__.'/../config/active-models.php', 
            'active-html'
        );
    }

    public function boot()
    {
        // Publish Config
        $this->publishes([
            __DIR__.'/../config/active-models.php' => config_path('active-html.php'),
        ], 'active-html-config');

        // Register Routes
        $this->registerRoutes();
    }

    /**
     * Register package routes
     * Compatible with Laravel 10, 11, and 12
     */
    protected function registerRoutes()
    {
        Route::group([
            'prefix' => config('active-html.route_prefix', 'active-html'),
            'middleware' => config('active-html.route_middleware', ['web']),
        ], function () {
            Route::post('model/{action}', [
                \ChayseHartsuff\ActiveHtml\Http\Controllers\ModelController::class, 
                'index'
            ])->name('active-html.model');
        });
    }
}