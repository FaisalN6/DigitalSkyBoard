<?php

namespace App\Http\Controllers;

use App\Models\Airport;
use Illuminate\Http\Request;

class AirportController extends Controller
{
    /**
     * Display a listing of airports with pagination, search, sort, and filter
     */
    public function index(Request $request)
    {
        $query = Airport::query();

        // Search by name, code, city, or country
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('country', 'like', "%{$search}%");
            });
        }

        // Filter by country
        if ($request->has('country')) {
            $query->where('country', $request->country);
        }

        // Sort
        $sortField = $request->get('sort_by', 'id');
        $sortDirection = $request->get('sort_direction', 'asc');
        
        if (in_array($sortField, ['id', 'name', 'code', 'city', 'country', 'created_at'])) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Paginate
        $perPage = $request->get('per_page', 10);
        $airports = $query->paginate($perPage);
        
        return response()->json($airports, 200);
    }

    /**
     * Store a newly created airport
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:airports,code',
            'city' => 'required|string|max:255',
            'country' => 'required|string|max:255',
        ]);

        $airport = Airport::create($validated);

        return response()->json([
            'message' => 'Airport created successfully',
            'data' => $airport
        ], 201);
    }

    /**
     * Display the specified airport
     */
    public function show($id)
    {
        $airport = Airport::find($id);

        if (!$airport) {
            return response()->json([
                'message' => 'Airport not found'
            ], 404);
        }

        return response()->json([
            'data' => $airport
        ], 200);
    }

    /**
     * Update the specified airport
     */
    public function update(Request $request, $id)
    {
        $airport = Airport::find($id);

        if (!$airport) {
            return response()->json([
                'message' => 'Airport not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:10|unique:airports,code,' . $id,
            'city' => 'sometimes|required|string|max:255',
            'country' => 'sometimes|required|string|max:255',
        ]);

        $airport->update($validated);

        return response()->json([
            'message' => 'Airport updated successfully',
            'data' => $airport
        ], 200);
    }

    /**
     * Remove the specified airport
     */
    public function destroy($id)
    {
        $airport = Airport::find($id);

        if (!$airport) {
            return response()->json([
                'message' => 'Airport not found'
            ], 404);
        }

        $airport->delete();

        return response()->json([
            'message' => 'Airport deleted successfully'
        ], 200);
    }
}
