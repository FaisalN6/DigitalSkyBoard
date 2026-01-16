<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    protected $fillable = [
        'flight_number',
        'departure_time',
        'departure_date',
        'airline_id',
        'destination_airport_id',
        'gate_id',
        'status_id',
        'user_id',
    ];

    /**
     * Get the user who manages this flight
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the airline for this flight
     */
    public function airline()
    {
        return $this->belongsTo(Airline::class);
    }

    /**
     * Get the destination airport for this flight
     */
    public function destinationAirport()
    {
        return $this->belongsTo(Airport::class, 'destination_airport_id');
    }

    /**
     * Get the gate for this flight
     */
    public function gate()
    {
        return $this->belongsTo(Gate::class);
    }

    /**
     * Get the status for this flight
     */
    public function status()
    {
        return $this->belongsTo(FlightStatus::class, 'status_id');
    }
}
