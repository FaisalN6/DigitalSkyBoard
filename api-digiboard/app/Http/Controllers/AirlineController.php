<?php

namespace App\Http\Controllers;

use App\Models\Airline;
use Illuminate\Http\Request;

class AirlineController extends Controller
{
    /**
     * Display a listing of airlines with pagination, search, sort, and filter
     */
    public function index(Request $request)
    {
        $query = Airline::query();

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortField = $request->get('sort_by', 'id');
        $sortDirection = $request->get('sort_direction', 'asc');
        
        if (in_array($sortField, ['id', 'name', 'code', 'created_at'])) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Paginate
        $perPage = $request->get('per_page', 10);
        $airlines = $query->paginate($perPage);
        
        return response()->json($airlines, 200);
    }

    /**
     * Store a newly created airline with logo upload
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:airlines,code',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('airlines/logos', 'public');
            $validated['logo'] = $logoPath;
        }

        $airline = Airline::create($validated);

        return response()->json([
            'message' => 'Airline created successfully',
            'data' => $airline
        ], 201);
    }

    /**
     * Display the specified airline
     */
    public function show($id)
    {
        $airline = Airline::find($id);

        if (!$airline) {
            return response()->json([
                'message' => 'Airline not found'
            ], 404);
        }

        return response()->json([
            'data' => $airline
        ], 200);
    }

    /**
     * Update the specified airline with optional logo upload
     */
    public function update(Request $request, $id)
    {
        $airline = Airline::find($id);

        if (!$airline) {
            return response()->json([
                'message' => 'Airline not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:10|unique:airlines,code,' . $id,
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($airline->logo && \Storage::disk('public')->exists($airline->logo)) {
                \Storage::disk('public')->delete($airline->logo);
            }
            
            $logoPath = $request->file('logo')->store('airlines/logos', 'public');
            $validated['logo'] = $logoPath;
        }

        $airline->update($validated);

        return response()->json([
            'message' => 'Airline updated successfully',
            'data' => $airline
        ], 200);
    }

    /**
     * Remove the specified airline and its logo
     */
    public function destroy($id)
    {
        $airline = Airline::find($id);

        if (!$airline) {
            return response()->json([
                'message' => 'Airline not found'
            ], 404);
        }

        // Delete logo file if exists
        if ($airline->logo && \Storage::disk('public')->exists($airline->logo)) {
            \Storage::disk('public')->delete($airline->logo);
        }

        $airline->delete();

        return response()->json([
            'message' => 'Airline deleted successfully'
        ], 200);
    }
}
