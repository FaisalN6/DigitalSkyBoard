<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FlightSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('flights')->insert([
            [
                'flight_number' => 'GA-101',
                'departure_time' => '08:00:00',
                'departure_date' => '2026-01-08',
                'airline_id' => 1, // Garuda Indonesia
                'destination_airport_id' => 2, // DPS
                'gate_id' => 1, // A1
                'status_id' => 1, // On Time
                'user_id' => 1, // Admin
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'flight_number' => 'JT-202',
                'departure_time' => '10:30:00',
                'departure_date' => '2026-01-08',
                'airline_id' => 2, // Lion Air
                'destination_airport_id' => 3, // SUB
                'gate_id' => 5, // A5
                'status_id' => 4, // Boarding
                'user_id' => 2, // Operator 1
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'flight_number' => 'QG-303',
                'departure_time' => '12:15:00',
                'departure_date' => '2026-01-08',
                'airline_id' => 3, // Citilink
                'destination_airport_id' => 4, // KNO
                'gate_id' => 12, // B2
                'status_id' => 2, // Delayed
                'user_id' => 3, // Operator 2
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'flight_number' => 'ID-404',
                'departure_time' => '14:45:00',
                'departure_date' => '2026-01-08',
                'airline_id' => 4, // Batik Air
                'destination_airport_id' => 5, // UPG
                'gate_id' => 18, // B8
                'status_id' => 1, // On Time
                'user_id' => 1, // Admin
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'flight_number' => 'QZ-505',
                'departure_time' => '16:20:00',
                'departure_date' => '2026-01-08',
                'airline_id' => 5, // AirAsia
                'destination_airport_id' => 6, // PDG
                'gate_id' => 23, // C3
                'status_id' => 1, // On Time
                'user_id' => 2, // Operator 1
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'flight_number' => 'GA-606',
                'departure_time' => '06:00:00',
                'departure_date' => '2026-01-08',
                'airline_id' => 1, // Garuda Indonesia
                'destination_airport_id' => 3, // SUB
                'gate_id' => 7, // A7
                'status_id' => 5, // Departed
                'user_id' => 3, // Operator 2
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'flight_number' => 'JT-707',
                'departure_time' => '18:30:00',
                'departure_date' => '2026-01-08',
                'airline_id' => 2, // Lion Air
                'destination_airport_id' => 2, // DPS
                'gate_id' => 28, // C8
                'status_id' => 1, // On Time
                'user_id' => 1, // Admin
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'flight_number' => 'QG-808',
                'departure_time' => '20:00:00',
                'departure_date' => '2026-01-08',
                'airline_id' => 3, // Citilink
                'destination_airport_id' => 5, // UPG
                'gate_id' => 15, // B5
                'status_id' => 3, // Cancelled
                'user_id' => 2, // Operator 1
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'flight_number' => 'ID-909',
                'departure_time' => '22:15:00',
                'departure_date' => '2026-01-08',
                'airline_id' => 4, // Batik Air
                'destination_airport_id' => 4, // KNO
                'gate_id' => 3, // A3
                'status_id' => 1, // On Time
                'user_id' => 3, // Operator 2
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'flight_number' => 'QZ-1010',
                'departure_time' => '07:45:00',
                'departure_date' => '2026-01-09',
                'airline_id' => 5, // AirAsia
                'destination_airport_id' => 2, // DPS
                'gate_id' => 20, // C10
                'status_id' => 1, // On Time
                'user_id' => 1, // Admin
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
