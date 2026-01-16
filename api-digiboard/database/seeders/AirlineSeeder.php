<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AirlineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('airlines')->insert([
            [
                'name' => 'Garuda Indonesia',
                'code' => 'GA',
                'logo' => 'logos/garuda.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Lion Air',
                'code' => 'JT',
                'logo' => 'logos/lion.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Citilink',
                'code' => 'QG',
                'logo' => 'logos/citilink.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Batik Air',
                'code' => 'ID',
                'logo' => 'logos/batik.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'AirAsia',
                'code' => 'QZ',
                'logo' => 'logos/airasia.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
