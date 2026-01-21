<?php

namespace ChayseHartsuff\ActiveHtml;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class ActiveHtmlServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // Publish Config
        $this->publishes([
            __DIR__.'/../config/active-models.php' => config_path('active-html.php'),
        ], 'active-html-config');

        // Register Routes
        Route::post('model/{action}', [Http\Controllers\ModelController::class, 'index']);
    }

    public function register()
    {
        $this->mergeConfigFrom(__DIR__.'/../config/active-models.php', 'active-html');
    }
}