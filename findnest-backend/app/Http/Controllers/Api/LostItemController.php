<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LostItemReport;
use App\Models\AuditLog;
use App\Services\ItemDescriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LostItemController extends Controller
{
    public function index(Request $request)
    {
        $reports = LostItemReport::with('user')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['reports' => $reports]);
    }

    public function myReports(Request $request)
    {
        $reports = LostItemReport::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['reports' => $reports]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'item_name' => 'required|string|max:255',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'location_lost' => 'required|string',
            'date_lost' => 'required|date',
            'photo_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $aiDescription = null;

        if ($request->photo_url) {
            $descriptionService = new ItemDescriptionService();
            $analysis = $descriptionService->analyzeImage($request->photo_url);

            if (!$analysis['success']) {
                return response()->json(['message' => $analysis['message']], 422);
            }

            if (!$analysis['item_detected']) {
                return response()->json(['message' => $analysis['message']], 422);
            }

            $aiDescription = $analysis['ai_description'];
        }

        $report = LostItemReport::create([
            'user_id' => $request->user()->id,
            'item_name' => $request->item_name,
            'category' => $request->category,
            'description' => $request->description,
            'ai_description' => $aiDescription,
            'location_lost' => $request->location_lost,
            'date_lost' => $request->date_lost,
            'photo_url' => $request->photo_url,
            'status' => 'searching',
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Lost Item Reported',
            'target_type' => 'lost_item_reports',
            'target_id' => $report->id,
            'details' => 'Student reported lost item: ' . $report->item_name . ' and ' . $report->location_lost,
            'performed_by' => 'Student: ' . $request->user()->name,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Lost item report submitted successfully',
            'report' => $report
        ], 201);
    }

    public function show($id)
    {
        $report = LostItemReport::with(['user', 'aiMatches'])->findOrFail($id);
        return response()->json(['report' => $report]);
    }

    public function update(Request $request, $id)
    {
        $report = LostItemReport::findOrFail($id);

        $report->update($request->only([
            'item_name', 'category', 'description',
            'location_lost', 'date_lost', 'photo_url', 'status'
        ]));

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Lost Item Report Updated',
            'target_type' => 'lost_item_reports',
            'target_id' => $report->id,
            'details' => 'Report updated for: ' . $report->item_name,
            'performed_by' => $request->user()->name,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Report updated successfully',
            'report' => $report
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $report = LostItemReport::findOrFail($id);
        $report->delete();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Lost Item Report Deleted',
            'target_type' => 'lost_item_reports',
            'target_id' => $id,
            'details' => 'Report deleted for: ' . $report->item_name,
            'performed_by' => $request->user()->name,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Report deleted successfully']);
    }
}
