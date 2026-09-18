<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\LostItemReport;
use App\Models\FoundItemRecord;
use App\Models\AiMatch;
use App\Models\Claim;
use App\Models\Notification;
use App\Models\AuditLog;
use App\Models\LocationLog;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SystemStatsController extends Controller
{
    public function index()
    {
        $totalRecords = User::count()
            + LostItemReport::count()
            + FoundItemRecord::count()
            + AiMatch::count()
            + Claim::count()
            + Notification::count()
            + AuditLog::count()
            + LocationLog::count();

        $sizeResult = DB::selectOne("SELECT pg_database_size(current_database()) as size");
        $dbSizeGb = round($sizeResult->size / 1073741824, 2);

        return response()->json([
            'total_records' => $totalRecords,
            'db_size_gb' => $dbSizeGb,
        ]);
    }

    public function getSettings()
    {
        return response()->json([
            'match_confidence_threshold' => (int) SystemSetting::get('match_confidence_threshold', 75),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'match_confidence_threshold' => 'required|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        SystemSetting::set('match_confidence_threshold', (string) $request->match_confidence_threshold);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'System Setting Updated',
            'target_type' => 'system_settings',
            'target_id' => 0,
            'details' => 'Match confidence threshold changed to ' . $request->match_confidence_threshold . '%',
            'performed_by' => 'Super Admin: ' . $request->user()->name,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Settings updated successfully',
            'match_confidence_threshold' => (int) $request->match_confidence_threshold,
        ]);
    }
}
