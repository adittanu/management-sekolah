<?php

use App\Http\Middleware\StaticTokenAuth;
use App\Mcp\Servers\GuruServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/guru', GuruServer::class)
    ->middleware([StaticTokenAuth::class, 'throttle:60,1']);
