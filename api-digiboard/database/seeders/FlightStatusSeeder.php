<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FlightStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('flight_statuses')->insert([
            [
                'name' => 'On Time',
                'color' => '#22c55e', // green-500
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Delayed',
                'color' => '#eab308', // yellow-500
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Cancelled',
                'color' => '#ef4444', // red-500
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Boarding',
                'color' => '#3b82f6', // blue-500
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Departed',
                'color' => '#6b7280', // gray-500
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Arrived',
                'color' => '#ffffff', // white
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
