<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImportUserRequest;
use App\Services\UserImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class ImportUserController extends Controller
{
    public function __construct(
        protected UserImportService $importService
    ) {}

    public function preview(ImportUserRequest $request)
    {
        $data = $this->importService->preview($request->file('file'));
        
        return response()->json([
            'preview' => $data,
            'mapping' => [
                'email' => 'email',
                'firstname' => 'firstname',
                'lastname' => 'lastname',
                'password' => 'password',
                'username' => 'username',
                'cohort1' => 'cohort1',
                'classroom' => 'classroom',
            ]
        ]);
    }

    public function import(ImportUserRequest $request)
    {
        $result = $this->importService->import(
            $request->file('file'),
            $request->input('mapping', [])
        );

        // Return detailed result via flash for frontend
        if (!empty($result['errors'])) {
            return Redirect::back()
                ->with('flash', [
                    'success_count' => $result['success'],
                    'failed_count' => $result['failed'],
                    'error_messages' => $result['errors'],
                ])
                ->withErrors($result['errors']);
        }

        return Redirect::back()->with([
            'success' => "Import berhasil: {$result['success']} data diimport.",
            'flash' => [
                'success_count' => $result['success'],
                'failed_count' => $result['failed'],
                'error_messages' => [],
            ]
        ]);
    }
}
