<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use App\Models\Airline;
use App\Models\FlightStatus;
use App\Models\Gate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for Flight Information Display System
     */
    public function statistics(Request $request)
    {
        $today = now()->toDateString();

        // Total flights today
        $totalFlightsToday = Flight::whereDate('departure_date', $today)->count();

        // Flights by status
        $flightsByStatus = Flight::whereDate('departure_date', $today)
            ->select('status_id', DB::raw('count(*) as count'))
            ->with('status:id,name')
            ->groupBy('status_id')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status->name,
                    'count' => $item->count
                ];
            });

        // Flights by airline
        $flightsByAirline = Flight::whereDate('departure_date', $today)
            ->select('airline_id', DB::raw('count(*) as count'))
            ->with('airline:id,name,code')
            ->groupBy('airline_id')
            ->get()
            ->map(function ($item) {
                return [
                    'airline' => $item->airline->name,
                    'code' => $item->airline->code,
                    'count' => $item->count
                ];
            });

        // Upcoming departures (next 6 hours)
        $upcomingFlights = Flight::whereDate('departure_date', $today)
            ->where('departure_time', '>=', now()->format('H:i:s'))
            ->where('departure_time', '<=', now()->addHours(6)->format('H:i:s'))
            ->with(['airline:id,name,code', 'destinationAirport:id,name,code,city', 'gate:id,code', 'status:id,name'])
            ->orderBy('departure_time', 'asc')
            ->limit(10)
            ->get()
            ->map(function ($flight) {
                return [
                    'id' => $flight->id,
                    'flight_number' => $flight->flight_number,
                    'airline' => $flight->airline->name,
                    'airline_code' => $flight->airline->code,
                    'destination' => $flight->destinationAirport->city,
                    'destination_code' => $flight->destinationAirport->code,
                    'gate' => $flight->gate->code,
                    'departure_time' => $flight->departure_time,
                    'status' => $flight->status->name,
                ];
            });

        // Gate utilization
        $gateUtilization = Gate::withCount(['flights' => function ($query) use ($today) {
                $query->whereDate('departure_date', $today);
            }])
            ->having('flights_count', '>', 0)
            ->orderBy('flights_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($gate) {
                return [
                    'gate' => $gate->code,
                    'flights' => $gate->flights_count
                ];
            });

        // Recent updates (flights updated in last hour)
        $recentUpdates = Flight::whereDate('departure_date', $today)
            ->where('updated_at', '>=', now()->subHour())
            ->with(['airline:id,name,code', 'destinationAirport:id,name,code,city', 'status:id,name'])
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($flight) {
                return [
                    'flight_number' => $flight->flight_number,
                    'airline' => $flight->airline->name,
                    'destination' => $flight->destinationAirport->city,
                    'status' => $flight->status->name,
                    'updated_at' => $flight->updated_at->format('H:i:s'),
                ];
            });

        // Summary statistics
        $summary = [
            'total_flights_today' => $totalFlightsToday,
            'total_airlines' => Airline::count(),
            'total_gates' => Gate::count(),
            'active_gates_today' => $gateUtilization->count(),
        ];

        return response()->json([
            'summary' => $summary,
            'flights_by_status' => $flightsByStatus,
            'flights_by_airline' => $flightsByAirline,
            'upcoming_departures' => $upcomingFlights,
            'gate_utilization' => $gateUtilization,
            'recent_updates' => $recentUpdates,
        ], 200);
    }

    /**
     * Get all flights for today with filtering
     */
    public function todayFlights(Request $request)
    {
        $today = now()->toDateString();
        
        $query = Flight::whereDate('departure_date', $today)
            ->with(['airline:id,name,code', 'destinationAirport:id,name,code,city', 'gate:id,code', 'status:id,name']);

        // Filter by status
        if ($request->has('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        // Filter by airline
        if ($request->has('airline_id')) {
            $query->where('airline_id', $request->airline_id);
        }

        // Search by flight number
        if ($request->has('search')) {
            $query->where('flight_number', 'like', '%' . $request->search . '%');
        }

        $flights = $query->orderBy('departure_time', 'asc')->get()->map(function ($flight) {
            return [
                'id' => $flight->id,
                'flight_number' => $flight->flight_number,
                'airline' => $flight->airline->name,
                'airline_code' => $flight->airline->code,
                'destination' => $flight->destinationAirport->name,
                'destination_city' => $flight->destinationAirport->city,
                'destination_code' => $flight->destinationAirport->code,
                'gate' => $flight->gate->code,
                'departure_time' => $flight->departure_time,
                'departure_date' => $flight->departure_date,
                'status' => $flight->status->name,
            ];
        });

        return response()->json([
            'date' => $today,
            'total' => $flights->count(),
            'flights' => $flights,
        ], 200);
    }
}
