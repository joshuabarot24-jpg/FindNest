<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\AiMatch;
use App\Models\LostItemReport;
use App\Models\FoundItemRecord;
use App\Models\Notification;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Services\FcmService;

class ClaimController extends Controller
{
    public function index()
    {
        $claims = Claim::with(['student', 'admin', 'match.lostReport', 'match.foundRecord'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['claims' => $claims]);
    }

    public function myClaims(Request $request)
    {
        $claims = Claim::with(['match.lostReport', 'match.foundRecord'])
            ->where('student_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['claims' => $claims]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'match_id' => 'required|exists:ai_matches,id',
            'proof_description' => 'required|string',
            'proof_photo_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $existing = Claim::where('match_id', $request->match_id)
            ->where('student_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already submitted a claim for this item'], 409);
        }

        $claim = Claim::create([
            'match_id' => $request->match_id,
            'student_id' => $request->user()->id,
            'proof_description' => $request->proof_description,
            'proof_photo_url' => $request->proof_photo_url,
            'claim_status' => 'pending',
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Claim Submitted',
            'target_type' => 'claims',
            'target_id' => $claim->id,
            'details' => 'Student submitted ownership claim',
            'performed_by' => 'Student: ' . $request->user()->name,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Claim submitted successfully',
            'claim' => $claim
        ], 201);
    }

    public function approve(Request $request, $id)
    {
        $claim = Claim::findOrFail($id);

        $claim->update([
            'claim_status' => 'approved',
            'admin_id' => $request->user()->id,
            'admin_notes' => $request->admin_notes,
            'claimed_at' => Carbon::now(),
        ]);

        $match = AiMatch::find($claim->match_id);
        if ($match) {
            $match->update(['match_status' => 'confirmed']);
            LostItemReport::find($match->report_id)?->update(['status' => 'returned']);
            FoundItemRecord::find($match->found_id)?->update(['status' => 'claimed']);
        }

        $student = \App\Models\User::find($claim->student_id);
        if ($student && $student->fcm_token) {
            $fcm = new FcmService();
            $fcm->sendToUser(
            $student->fcm_token,
            'Claim Approved! ✅',
            'Your claim has been approved. Visit the Guidance Office to collect your item.',
            ['type' => 'claim_approved', 'claim_id' => (string)$claim->id]
        );
    }

        Notification::create([
            'user_id' => $claim->student_id,
            'match_id' => $claim->match_id,
            'title' => 'Claim Approved!',
            'message' => 'Your claim has been approved. Please visit the Guidance Office to collect your item.',
            'type' => 'status',
            'is_read' => false,
            'sent_at' => Carbon::now(),
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Claim Approved',
            'target_type' => 'claims',
            'target_id' => $claim->id,
            'details' => 'Admin approved ownership claim',
            'performed_by' => 'Admin: ' . $request->user()->name,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Claim approved successfully', 'claim' => $claim]);
    }

    public function reject(Request $request, $id)
    {
        $claim = Claim::findOrFail($id);

        $claim->update([
            'claim_status' => 'rejected',
            'admin_id' => $request->user()->id,
            'admin_notes' => $request->admin_notes,
        ]);

        $student = \App\Models\User::find($claim->student_id);
        if ($student && $student->fcm_token) {
            $fcm = new FcmService();
            $fcm->sendToUser(
            $student->fcm_token,
            'Claim Rejected ❌',
            'Your claim was rejected. Reason: ' . ($request->admin_notes ?? 'Insufficient proof.'),
            ['type' => 'claim_rejected', 'claim_id' => (string)$claim->id]
        );
    }

        Notification::create([
            'user_id' => $claim->student_id,
            'match_id' => $claim->match_id,
            'title' => 'Claim Rejected',
            'message' => 'Your claim was rejected. Reason: ' . ($request->admin_notes ?? 'Insufficient proof provided.'),
            'type' => 'status',
            'is_read' => false,
            'sent_at' => Carbon::now(),
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Claim Rejected',
            'target_type' => 'claims',
            'target_id' => $claim->id,
            'details' => 'Admin rejected ownership claim. Reason: ' . $request->admin_notes,
            'performed_by' => 'Admin: ' . $request->user()->name,
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Claim rejected', 'claim' => $claim]);
    }

}
