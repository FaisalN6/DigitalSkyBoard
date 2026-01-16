<?php

namespace App\Http\Controllers;

use App\Models\Gate;
use Illuminate\Http\Request;

class GateController extends Controller
{
    /**
     * Display a listing of gates with pagination, search, and sort
     */
    public function index(Request $request)
    {
        $query = Gate::query();

        // Search by code
        if ($request->has('search')) {
            $query->where('code', 'like', "%{$request->search}%");
        }

        // Sort
        $sortField = $request->get('sort_by', 'id');
        $sortDirection = $request->get('sort_direction', 'asc');
        
        if (in_array($sortField, ['id', 'code', 'created_at'])) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Paginate
        $perPage = $request->get('per_page', 10);
        $gates = $query->paginate($perPage);
        
        return response()->json($gates, 200);
    }

    /**
     * Store a newly created gate
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|unique:gates,code',
        ]);

        $gate = Gate::create($validated);

        return response()->json([
            'message' => 'Gate created successfully',
            'data' => $gate
        ], 201);
    }

    /**
     * Display the specified gate
     */
    public function show($id)
    {
        $gate = Gate::find($id);

        if (!$gate) {
            return response()->json([
                'message' => 'Gate not found'
            ], 404);
        }

        return response()->json([
            'data' => $gate
        ], 200);
    }

    /**
     * Update the specified gate
     */
    public function update(Request $request, $id)
    {
        $gate = Gate::find($id);

        if (!$gate) {
            return response()->json([
                'message' => 'Gate not found'
            ], 404);
        }

        $validated = $request->validate([
            'code' => 'sometimes|required|string|max:10|unique:gates,code,' . $id,
        ]);

        $gate->update($validated);

        return response()->json([
            'message' => 'Gate updated successfully',
            'data' => $gate
        ], 200);
    }

    /**
     * Remove the specified gate
     */
    public function destroy($id)
    {
        $gate = Gate::find($id);

        if (!$gate) {
            return response()->json([
                'message' => 'Gate not found'
            ], 404);
        }

        $gate->delete();

        return response()->json([
            'message' => 'Gate deleted successfully'
        ], 200);
    }
}
