<?php

use Illuminate\Support\Facades\Route;
use ChayseHartsuff\ActiveHtml\Http\Controllers\ModelController;

Route::prefix('')->middleware(['web', 'auth'])->group(function () {
    Route::post('model/{action}', [ModelController::class, 'index']);
});