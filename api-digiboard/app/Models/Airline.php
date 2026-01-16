<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Airline extends Model
{
    protected $fillable = [
        'name',
        'code',
        'logo',
    ];

    /**
     * Get all flights for this airline
     */
    public function flights()
    {
        return $this->hasMany(Flight::class);
    }
}
