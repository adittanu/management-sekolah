<?php

namespace App\Services;

use App\Models\User;
use App\Models\Classroom;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class UserImportService
{
    public function preview($file)
    {
        $spreadsheet = IOFactory::load($file->getPathname());
        $sheet = $spreadsheet->getActiveSheet();
        
        $rows = [];
        foreach ($sheet->getRowIterator() as $index => $row) {
            if ($index > 6) break; // Header + 5 rows
            
            $cellIterator = $row->getCellIterator();
            $cellIterator->setIterateOnlyExistingCells(false);
            
            $cells = [];
            foreach ($cellIterator as $cell) {
                $cells[] = $cell->getValue();
            }
            $rows[] = $cells;
        }

        return [
            'header' => $rows[0] ?? [],
            'data' => array_slice($rows, 1),
        ];
    }

    public function import($file, $mapping = [])
    {
        $spreadsheet = IOFactory::load($file->getPathname());
        $sheet = $spreadsheet->getActiveSheet();
        
        $stats = [
            'success' => 0,
            'failed' => 0,
            'errors' => []
        ];

        $rows = $sheet->toArray();
        if (empty($rows)) {
            return $stats;
        }

        // Normalize header for mapping
        $header = array_map('strtolower', $rows[0]);
        $dataRows = array_slice($rows, 1);
        
        // Use provided mapping or default
        $colMap = $this->resolveMapping($header, $mapping);

        // Process in chunks to prevent timeout
        $chunkSize = 50;
        $chunks = array_chunk($dataRows, $chunkSize);

        foreach ($chunks as $chunkIndex => $chunk) {
            foreach ($chunk as $index => $row) {
                $rowIndex = ($chunkIndex * $chunkSize) + $index + 2;
                set_time_limit(30); 

                DB::beginTransaction();
                try {
                    $userData = $this->extractUserData($row, $colMap);
                    
                    if (empty($userData['email'])) {
                        throw new \Exception("Email is empty");
                    }

                    // Create/Update User
                    $user = User::updateOrCreate(
                        ['email' => $userData['email']],
                        [
                            'name' => $userData['name'],
                            'password' => Hash::make($userData['password'] ?? 'password'),
                            'role' => $userData['role'],
                            'identity_number' => $userData['identity_number'] ?? null,
                        ]
                    );

                    // Assign to classroom based on Role
                    if (!empty($userData['cohort'])) {
                        if ($user->role === 'student') {
                            // For students, cohort is their classroom
                            $classroom = Classroom::firstOrCreate(['name' => $userData['cohort']]);
                            $user->classrooms()->syncWithoutDetaching([$classroom->id]);
                        } 
                        elseif ($user->role === 'teacher') {
                            // For teachers, cohort might be the classroom they are homeroom teacher for
                            // Check if cohort matches a classroom name pattern
                            // Or if explicitly mapped as a homeroom assignment
                            
                            // Simple logic: If cohort is NOT 'Teacher'/'Guru', assume it's a class they manage
                            $isClassroomName = stripos($userData['cohort'], 'Teacher') === false && stripos($userData['cohort'], 'Guru') === false;
                            
                            if ($isClassroomName) {
                                $classroom = Classroom::firstOrCreate(['name' => $userData['cohort']]);
                                // Assign as homeroom teacher
                                $classroom->update(['teacher_id' => $user->id]);
                            }
                        }
                    }

                    DB::commit();
                    $stats['success']++;

                } catch (\Exception $e) {
                    DB::rollBack();
                    $stats['failed']++;
                    $stats['errors'][] = "Row {$rowIndex}: " . $e->getMessage();
                    Log::error("Import Error Row {$rowIndex}: " . $e->getMessage());
                }
            }
        }

        return $stats;
    }

    private function resolveMapping($header, $manualMapping)
    {
        // Default expected columns
        $map = [
            'email' => -1,
            'firstname' => -1,
            'lastname' => -1,
            'password' => -1,
            'username' => -1, // identity_number
            'cohort1' => -1,
        ];

        // 1. Try manual mapping
        foreach ($manualMapping as $key => $colName) {
            if ($colName === 'ignore') continue;
            
            $idx = array_search(strtolower($colName), $header);
            if ($idx !== false) {
                $map[$key] = $idx;
            }
        }

        // 2. Fallback to direct name match
        foreach ($map as $key => $idx) {
            if ($idx === -1) {
                $found = array_search($key, $header);
                if ($found !== false) {
                    $map[$key] = $found;
                }
            }
        }

        return $map;
    }

    private function extractUserData($row, $map)
    {
        $firstname = isset($map['firstname']) && $map['firstname'] > -1 ? ($row[$map['firstname']] ?? '') : '';
        $lastname = isset($map['lastname']) && $map['lastname'] > -1 ? ($row[$map['lastname']] ?? '') : '';
        $cohort = isset($map['cohort1']) && $map['cohort1'] > -1 ? ($row[$map['cohort1']] ?? '') : '';
        
        $email = isset($map['email']) && $map['email'] > -1 ? ($row[$map['email']] ?? null) : null;
        $password = isset($map['password']) && $map['password'] > -1 ? ($row[$map['password']] ?? null) : null;
        $username = isset($map['username']) && $map['username'] > -1 ? ($row[$map['username']] ?? null) : null;

        // Determine role logic - Fixed logic
        $role = 'student';
        $cohortStr = (string) $cohort;
        
        if (stripos($cohortStr, 'Teacher') !== false || stripos($cohortStr, 'Guru') !== false) {
            $role = 'teacher';
        }

        return [
            'name' => trim("$firstname $lastname"),
            'email' => $email,
            'password' => $password,
            'identity_number' => $username,
            'role' => $role,
            'cohort' => $cohortStr,
        ];
    }
}
