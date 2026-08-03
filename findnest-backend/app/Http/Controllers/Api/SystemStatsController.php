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
use Illuminate\Support\Facades\DB;

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
}
