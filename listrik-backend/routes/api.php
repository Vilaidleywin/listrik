<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\BillController;

Route::apiResource('bills', BillController::class);
Route::patch('bills/{bill}/toggle-paid', [BillController::class, 'togglePaid']);

Route::get('/bills/{bill}', [BillController::class, 'show']);

Route::apiResource('customers', CustomerController::class);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', function (Request $request) {
        return $request->user();
    });
});

Route::get('/ping', function () {
    return response()->json(['ok' => true]);
});
