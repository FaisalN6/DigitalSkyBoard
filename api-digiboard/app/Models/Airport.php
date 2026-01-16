<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Airport extends Model
{
    protected $fillable = [
        'name',
        'code',
        'city',
        'country',
    ];

    /**
     * Get all flights with this airport as destination
     */
    public function destinationFlights()
    {
        return $this->hasMany(Flight::class, 'destination_airport_id');
    }
}
