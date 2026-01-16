<?php

namespace App\Http\Controllers;

use App\Models\FlightStatus;
use Illuminate\Http\Request;

class FlightStatusController extends Controller
{
    /**
     * Display a listing of flight statuses with pagination, search, and sort
     */
    public function index(Request $request)
    {
        $query = FlightStatus::query();

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // Sort
        $sortField = $request->get('sort_by', 'id');
        $sortDirection = $request->get('sort_direction', 'asc');
        
        if (in_array($sortField, ['id', 'name', 'created_at'])) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Paginate
        $perPage = $request->get('per_page', 10);
        $statuses = $query->paginate($perPage);
        
        return response()->json($statuses, 200);
    }

    /**
     * Store a newly created flight status
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:flight_statuses,name',
            'color' => 'required|string|max:7', // Hex code eg #FFFFFF
        ]);

        $status = FlightStatus::create($validated);

        return response()->json([
            'message' => 'Flight status created successfully',
            'data' => $status
        ], 201);
    }

    /**
     * Display the specified flight status
     */
    public function show($id)
    {
        $status = FlightStatus::find($id);

        if (!$status) {
            return response()->json([
                'message' => 'Flight status not found'
            ], 404);
        }

        return response()->json([
            'data' => $status
        ], 200);
    }

    /**
     * Update the specified flight status
     */
    public function update(Request $request, $id)
    {
        $status = FlightStatus::find($id);

        if (!$status) {
            return response()->json([
                'message' => 'Flight status not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:flight_statuses,name,' . $id,
            'color' => 'sometimes|required|string|max:7',
        ]);

        $status->update($validated);

        return response()->json([
            'message' => 'Flight status updated successfully',
            'data' => $status
        ], 200);
    }

    /**
     * Remove the specified flight status
     */
    public function destroy($id)
    {
        $status = FlightStatus::find($id);

        if (!$status) {
            return response()->json([
                'message' => 'Flight status not found'
            ], 404);
        }

        $status->delete();

        return response()->json([
            'message' => 'Flight status deleted successfully'
        ], 200);
    }
}
