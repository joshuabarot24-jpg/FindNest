<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::prefix('auth')->group(function () {
    Route::post('/super-admin/login', [AuthController::class, 'superAdminLogin']);
    Route::post('/admin/login', [AuthController::class, 'adminLogin']);
    Route::post('/student/login', [AuthController::class, 'studentLogin']);
    Route::post('/student/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/student/resend-otp', [AuthController::class, 'resendOtp']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});
