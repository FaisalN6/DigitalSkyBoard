<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gate extends Model
{
    protected $fillable = [
        'code',
    ];

    /**
     * Get all flights using this gate
     */
    public function flights()
    {
        return $this->hasMany(Flight::class);
    }
}
