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
            ]
        ]);
    }

    public function import(ImportUserRequest $request)
    {
        $result = $this->importService->import(
            $request->file('file'),
            $request->input('mapping', [])
        );

        if (!empty($result['errors'])) {
            return Redirect::back()->withErrors($result['errors']);
        }

        return Redirect::back()->with('success', "Import completed: {$result['success']} imported, {$result['failed']} failed.");
    }
}
