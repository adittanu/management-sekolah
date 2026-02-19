<?php

use App\Http\Controllers\Integration\ExternalIdentityController;
use App\Http\Middleware\StaticTokenAuth;
use App\Mcp\Servers\GuruServer;
use Illuminate\Support\Facades\Route;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/guru', GuruServer::class)
    ->middleware([StaticTokenAuth::class, 'throttle:60,1']);

Route::prefix('integrations/external-identities')
    ->middleware([StaticTokenAuth::class, 'throttle:60,1'])
    ->group(function () {
        Route::post('/resolve', [ExternalIdentityController::class, 'resolve']);
        Route::post('/link', [ExternalIdentityController::class, 'link']);
    });
