<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $gates = [];
        
        // Generate gates A1-A10
        for ($i = 1; $i <= 10; $i++) {
            $gates[] = [
                'code' => 'A' . $i,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        // Generate gates B1-B10
        for ($i = 1; $i <= 10; $i++) {
            $gates[] = [
                'code' => 'B' . $i,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        // Generate gates C1-C10
        for ($i = 1; $i <= 10; $i++) {
            $gates[] = [
                'code' => 'C' . $i,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('gates')->insert($gates);
    }
}
