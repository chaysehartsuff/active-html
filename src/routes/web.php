<?php

use Illuminate\Support\Facades\Route;
use ChayseHartsuff\ActiveHtml\Http\Controllers\ModelController;

Route::prefix('')->group(function () {
    Route::post('model/{action}', [ModelController::class, 'index'])->middleware('web');
});