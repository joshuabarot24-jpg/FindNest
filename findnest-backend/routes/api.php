<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LostItemController;
use App\Http\Controllers\Api\FoundItemController;
use App\Http\Controllers\Api\ClaimController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AiMatchController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\FcmController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\SystemStatsController;
use App\Http\Controllers\Api\CaseTrailController;
use App\Http\Controllers\Api\ProfileController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);

    Route::get('/lost-items', [LostItemController::class, 'index']);
    Route::post('/lost-items', [LostItemController::class, 'store']);
    Route::get('/lost-items/{id}', [LostItemController::class, 'show']);
    Route::put('/lost-items/{id}', [LostItemController::class, 'update']);
    Route::delete('/lost-items/{id}', [LostItemController::class, 'destroy']);

    Route::get('/found-items', [FoundItemController::class, 'index']);
    Route::post('/found-items', [FoundItemController::class, 'store']);
    Route::get('/found-items/{id}', [FoundItemController::class, 'show']);
    Route::put('/found-items/{id}', [FoundItemController::class, 'update']);
    Route::delete('/found-items/{id}', [FoundItemController::class, 'destroy']);

    Route::get('/ai-matches', [AiMatchController::class, 'index']);
    Route::post('/ai-matches', [AiMatchController::class, 'store']);
    Route::get('/ai-matches/{id}', [AiMatchController::class, 'show']);
    Route::post('/ai-matches/{id}/confirm', [AiMatchController::class, 'confirm']);
    Route::post('/ai-matches/{id}/reject', [AiMatchController::class, 'reject']);

    Route::get('/claims', [ClaimController::class, 'index']);
    Route::post('/claims', [ClaimController::class, 'store']);
    Route::get('/claims/my-claims', [ClaimController::class, 'myClaims']);
    Route::post('/claims/{id}/approve', [ClaimController::class, 'approve']);
    Route::post('/claims/{id}/reject', [ClaimController::class, 'reject']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    Route::get('/locations', [LocationController::class, 'index']);
    Route::post('/locations', [LocationController::class, 'store']);
    Route::get('/locations/hotspots', [LocationController::class, 'hotspots']);

    Route::get('/audit-logs', [AuditLogController::class, 'index']);
    Route::get('/audit-logs/{type}/{id}', [AuditLogController::class, 'byCase']);

    Route::post('/upload/image', [UploadController::class, 'uploadImage']);
    Route::delete('/upload/image', [UploadController::class, 'deleteImage']);

    Route::get('/users', [UserManagementController::class, 'index']);
    Route::post('/users', [UserManagementController::class, 'store']);
    Route::put('/users/{id}', [UserManagementController::class, 'update']);
    Route::post('/users/{id}/revoke', [UserManagementController::class, 'revoke']);
    Route::post('/users/{id}/restore', [UserManagementController::class, 'restore']);

    Route::post('/fcm/token', [FcmController::class, 'updateToken']);

    Route::get('/system/stats', [SystemStatsController::class, 'index']);

    Route::get('/case-trail', [CaseTrailController::class, 'index']);
    Route::get('/case-trail/{id}', [CaseTrailController::class, 'show']);
});
