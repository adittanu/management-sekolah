<?php

namespace App\Services;

use App\Models\User;
use App\Models\Classroom;
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
        // Disable time limit for large imports
        set_time_limit(0);
        
        $spreadsheet = IOFactory::load($file->getPathname());
        $sheet = $spreadsheet->getActiveSheet();
        
        $stats = [
            'success' => 0,
            'failed' => 0,
            'errors' => []
        ];

        $rows = $sheet->toArray();
        if (empty($rows)) {
            $stats['errors'][] = "File is empty or cannot be read.";
            return $stats;
        }

        // Normalize header for mapping
        $header = array_map('strtolower', $rows[0]);
        $dataRows = array_slice($rows, 1);
        
        if (empty($dataRows)) {
            $stats['errors'][] = "No data rows found in file.";
            return $stats;
        }

        // Use provided mapping or default
        $colMap = $this->resolveMapping($header, $mapping);

        // Wrap entire import in a single transaction - all or nothing
        DB::beginTransaction();
        
        try {
            foreach ($dataRows as $index => $row) {
                $rowIndex = $index + 2; // +2 because of header row and 0-based index

                $userData = $this->extractUserData($row, $colMap);
                
                if (empty($userData['email'])) {
                    throw new \Exception("Row {$rowIndex}: Email is empty");
                }

                // Check if user exists first
                $existingUser = User::where('email', $userData['email'])->first();
                
                if ($existingUser) {
                    // Update existing user (skip password hashing unless new password provided)
                    $existingUser->name = $userData['name'];
                    $existingUser->role = $userData['role']; // Set directly (not mass-assignable)
                    $existingUser->identity_number = $userData['identity_number'] ?? null;
                    
                    // Only set new password if explicitly provided (auto-hashed by model cast)
                    if (!empty($userData['password'])) {
                        $existingUser->password = $userData['password'];
                    }
                    
                    $existingUser->save();
                    $user = $existingUser;
                } else {
                    // Create new user (password auto-hashed by model cast)
                    $user = new User();
                    $user->name = $userData['name'];
                    $user->email = $userData['email'];
                    $user->password = $userData['password'] ?? 'password';
                    $user->role = $userData['role']; // Set directly (not mass-assignable)
                    $user->identity_number = $userData['identity_number'] ?? null;
                    $user->save();
                }

                // Assign to classroom based on Role
                if (!empty($userData['classroom'])) {
                    if ($user->role === 'student') {
                        // Extract classroom details from name if possible (e.g., XI-RPL-1)
                        $classDetails = $this->parseClassroomName($userData['classroom']);
                        
                        $classroom = Classroom::firstOrCreate(
                            ['name' => $userData['classroom']],
                            [
                                'level' => $classDetails['level'],
                                'major' => $classDetails['major'],
                                'academic_year' => date('Y') . '/' . (date('Y') + 1)
                            ]
                        );
                        $user->classrooms()->syncWithoutDetaching([$classroom->id]);
                    }
                } elseif (!empty($userData['cohort'])) {
                    // Fallback to old logic if classroom column not mapped but cohort is
                    if ($user->role === 'student') {
                        // For students, cohort is their classroom
                        $classDetails = $this->parseClassroomName($userData['cohort']);

                        $classroom = Classroom::firstOrCreate(
                            ['name' => $userData['cohort']],
                            [
                                'level' => $classDetails['level'],
                                'major' => $classDetails['major'],
                                'academic_year' => date('Y') . '/' . (date('Y') + 1)
                            ]
                        );
                        $user->classrooms()->syncWithoutDetaching([$classroom->id]);
                    } 
                    elseif ($user->role === 'teacher') {
                        // For teachers, cohort might be the classroom they are homeroom teacher for
                        // Simple logic: If cohort is NOT 'Teacher'/'Guru', assume it's a class they manage
                        $isClassroomName = stripos($userData['cohort'], 'Teacher') === false && stripos($userData['cohort'], 'Guru') === false;
                        
                        if ($isClassroomName) {
                            $classDetails = $this->parseClassroomName($userData['cohort']);
                            
                            $classroom = Classroom::firstOrCreate(
                                ['name' => $userData['cohort']],
                                [
                                    'level' => $classDetails['level'],
                                    'major' => $classDetails['major'],
                                    'academic_year' => date('Y') . '/' . (date('Y') + 1)
                                ]
                            );
                            // Assign as homeroom teacher
                            $classroom->update(['teacher_id' => $user->id]);
                        }
                    }
                }

                $stats['success']++;
            }

            // All rows processed successfully, commit
            DB::commit();

        } catch (\Exception $e) {
            // Any error = rollback everything
            DB::rollBack();
            $stats['success'] = 0;
            $stats['failed'] = count($dataRows);
            $stats['errors'][] = $e->getMessage();
            Log::error("Import Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
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
            'classroom' => -1,
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
        $classroom = isset($map['classroom']) && $map['classroom'] > -1 ? ($row[$map['classroom']] ?? '') : '';
        
        $email = isset($map['email']) && $map['email'] > -1 ? ($row[$map['email']] ?? null) : null;
        $password = isset($map['password']) && $map['password'] > -1 ? ($row[$map['password']] ?? null) : null;
        $username = isset($map['username']) && $map['username'] > -1 ? ($row[$map['username']] ?? null) : null;

        // Determine role logic - Fixed logic
        $role = 'student';
        $cohortStr = (string) $cohort;
        $classroomStr = (string) $classroom;

        // Fallback: if cohort is empty but classroom is set, use classroom as cohort
        if (empty($cohortStr) && !empty($classroomStr)) {
            $cohortStr = $classroomStr;
        }

        // If classroom is empty but cohort looks like a classroom, use it
        if (empty($classroomStr) && !empty($cohortStr)) {
             // Simple logic: If cohort is NOT 'Teacher'/'Guru', assume it's a class they manage
             $isClassroomName = stripos($cohortStr, 'Teacher') === false && stripos($cohortStr, 'Guru') === false;
             if ($isClassroomName) {
                 $classroomStr = $cohortStr;
             }
        }
        
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
            'classroom' => $classroomStr,
        ];
    }

    private function parseClassroomName($name)
    {
        $parts = explode('-', $name);
        $level = '10'; // Default
        $major = 'UMUM'; // Default

        if (count($parts) >= 1) {
            // Try to detect level
            $lvl = strtoupper($parts[0]);
            if ($lvl === 'X' || $lvl === '10') $level = '10';
            elseif ($lvl === 'XI' || $lvl === '11') $level = '11';
            elseif ($lvl === 'XII' || $lvl === '12') $level = '12';
        }

        if (count($parts) >= 2) {
            $major = strtoupper($parts[1]);
        }

        return ['level' => $level, 'major' => $major];
    }
}
