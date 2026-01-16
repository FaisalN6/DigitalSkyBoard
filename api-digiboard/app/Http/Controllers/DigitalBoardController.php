<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use Illuminate\Http\Request;

class DigitalBoardController extends Controller
{
    /**
     * Display public digital board with today's flight information
     */
    public function index(Request $request)
    {
        $today = now()->toDateString();
        
        $query = Flight::whereDate('departure_date', $today)
            ->with([
                'airline:id,name,code,logo',
                'destinationAirport:id,name,code,city',
                'gate:id,code',
                'status:id,name,color'
            ]);

        // Optional filter by status
        if ($request->has('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        // Sort by departure time
        $flights = $query->orderBy('departure_time', 'asc')->get();

        // Transform response to include only needed fields
        $data = $flights->map(function ($flight) {
            return [
                'id' => $flight->id,
                'flight_number' => $flight->flight_number,
                'departure_time' => $flight->departure_time,
                'departure_date' => $flight->departure_date,
                'airline' => [
                    'name' => $flight->airline->name,
                    'code' => $flight->airline->code,
                    'logo' => $flight->airline->logo,
                ],
                'destination' => [
                    'name' => $flight->destinationAirport->name,
                    'city' => $flight->destinationAirport->city,
                    'code' => $flight->destinationAirport->code,
                ],
                'gate' => $flight->gate->code,
                'status' => [
                    'name' => $flight->status->name,
                    'color' => $flight->status->color,
                ],
            ];
        });

        return response()->json([
            'date' => $today,
            'total_flights' => $data->count(),
            'flights' => $data
        ], 200);
    }
}
