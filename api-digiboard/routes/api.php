<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AirlineController;
use App\Http\Controllers\AirportController;
use App\Http\Controllers\GateController;
use App\Http\Controllers\FlightStatusController;
use App\Http\Controllers\FlightController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DigitalBoardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'API OK'
    ]);
});
// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Public Digital Board routes (no authentication required)
Route::get('/digital-board', [DigitalBoardController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Dashboard routes
    Route::get('/dashboard/statistics', [DashboardController::class, 'statistics']);
    Route::get('/dashboard/today-flights', [DashboardController::class, 'todayFlights']);
    
    // CRUD Resource routes
    Route::apiResource('airlines', AirlineController::class);
    Route::apiResource('airports', AirportController::class);
    Route::apiResource('gates', GateController::class);
    Route::apiResource('flight-statuses', FlightStatusController::class);
    Route::apiResource('flights', FlightController::class);
    Route::apiResource('users', UserController::class);
});
