<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlightStatus extends Model
{
    protected $fillable = [
        'name',
        'color',
    ];

    /**
     * Get all flights with this status
     */
    public function flights()
    {
        return $this->hasMany(Flight::class, 'status_id');
    }
}
