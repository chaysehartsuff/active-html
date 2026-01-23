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
            __DIR__.'/../config/active-html.php', 
            'active-html'
        );
    }

    public function boot()
    {
        // Publish Config
        $this->publishes([
            __DIR__.'/../config/active-html.php' => config_path('active-html.php'),
        ], 'active-html-config');

        // Register Routes - Load routes file if it exists
        $this->loadRoutesFrom(__DIR__.'/routes/web.php');
    }
}