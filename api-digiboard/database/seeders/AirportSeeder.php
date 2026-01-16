<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AirportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('airports')->insert([
            [
                'name' => 'Soekarno-Hatta International Airport',
                'code' => 'CGK',
                'city' => 'Jakarta',
                'country' => 'Indonesia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ngurah Rai International Airport',
                'code' => 'DPS',
                'city' => 'Denpasar',
                'country' => 'Indonesia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Juanda International Airport',
                'code' => 'SUB',
                'city' => 'Surabaya',
                'country' => 'Indonesia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kualanamu International Airport',
                'code' => 'KNO',
                'city' => 'Medan',
                'country' => 'Indonesia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sultan Hasanuddin International Airport',
                'code' => 'UPG',
                'city' => 'Makassar',
                'country' => 'Indonesia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Minangkabau International Airport',
                'code' => 'PDG',
                'city' => 'Padang',
                'country' => 'Indonesia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
