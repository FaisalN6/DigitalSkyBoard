<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * Display a listing of flights with pagination, search, sort, and filters
     */
    public function index(Request $request)
    {
        $query = Flight::with(['airline:id,name,code', 'destinationAirport:id,name,code,city', 'gate:id,code', 'status:id,name,color', 'user:id,name']);

        // Search by flight number
        if ($request->has('search')) {
            $query->where('flight_number', 'like', "%{$request->search}%");
        }

        // Filter by date or date range
        if ($request->has('date')) {
            $query->whereDate('departure_date', $request->date);
        }
        
        if ($request->has('date_from') && $request->has('date_to')) {
            $query->whereBetween('departure_date', [$request->date_from, $request->date_to]);
        }

        // Filter by status
        if ($request->has('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        // Filter by airline
        if ($request->has('airline_id')) {
            $query->where('airline_id', $request->airline_id);
        }
        
        // Filter by gate
        if ($request->has('gate_id')) {
            $query->where('gate_id', $request->gate_id);
        }

        // Sort
        $sortField = $request->get('sort_by', 'departure_date');
        $sortDirection = $request->get('sort_direction', 'asc');
        
        $allowedSortFields = ['id', 'flight_number', 'departure_time', 'departure_date', 'created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('departure_date', 'asc')->orderBy('departure_time', 'asc');
        }

        // Paginate
        $perPage = $request->get('per_page', 15);
        $flights = $query->paginate($perPage);
        
        return response()->json($flights, 200);
    }

    /**
     * Store a newly created flight
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'flight_number' => 'required|string|max:50|unique:flights,flight_number',
            'departure_time' => 'required|date_format:H:i:s',
            'departure_date' => 'required|date',
            'airline_id' => 'required|exists:airlines,id',
            'destination_airport_id' => 'required|exists:airports,id',
            'gate_id' => 'required|exists:gates,id',
            'status_id' => 'required|exists:flight_statuses,id',
        ]);

        // Add authenticated user
        $validated['user_id'] = auth()->id();

        $flight = Flight::create($validated);
        $flight->load(['airline', 'destinationAirport', 'gate', 'status', 'user']);

        return response()->json([
            'message' => 'Flight created successfully',
            'data' => $flight
        ], 201);
    }

    /**
     * Display the specified flight
     */
    public function show($id)
    {
        $flight = Flight::with(['airline', 'destinationAirport', 'gate', 'status', 'user'])->find($id);

        if (!$flight) {
            return response()->json([
                'message' => 'Flight not found'
            ], 404);
        }

        return response()->json([
            'data' => $flight
        ], 200);
    }

    /**
     * Update the specified flight
     */
    public function update(Request $request, $id)
    {
        $flight = Flight::find($id);

        if (!$flight) {
            return response()->json([
                'message' => 'Flight not found'
            ], 404);
        }

        $validated = $request->validate([
            'flight_number' => 'sometimes|required|string|max:50|unique:flights,flight_number,' . $id,
            'departure_time' => 'sometimes|required|date_format:H:i:s',
            'departure_date' => 'sometimes|required|date',
            'airline_id' => 'sometimes|required|exists:airlines,id',
            'destination_airport_id' => 'sometimes|required|exists:airports,id',
            'gate_id' => 'sometimes|required|exists:gates,id',
            'status_id' => 'sometimes|required|exists:flight_statuses,id',
        ]);

        $flight->update($validated);
        $flight->load(['airline', 'destinationAirport', 'gate', 'status', 'user']);

        return response()->json([
            'message' => 'Flight updated successfully',
            'data' => $flight
        ], 200);
    }

    /**
     * Remove the specified flight
     */
    public function destroy($id)
    {
        $flight = Flight::find($id);

        if (!$flight) {
            return response()->json([
                'message' => 'Flight not found'
            ], 404);
        }

        $flight->delete();

        return response()->json([
            'message' => 'Flight deleted successfully'
        ], 200);
    }
}
