<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaticTokenAuth
{
    /**
     * Static token yang bisa digunakan semua user.
     * Ganti dengan token yang kamu inginkan.
     */
    private const STATIC_TOKEN = 'guru-mcp-token-2024';

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if ($token !== self::STATIC_TOKEN) {
            return response()->json([
                'error' => 'Unauthorized. Invalid token.',
            ], 401);
        }

        return $next($request);
    }
}
