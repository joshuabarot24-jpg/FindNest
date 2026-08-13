<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupportController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'message' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        AuditLog::create([
            'user_id'      => $request->user()->id,
            'action'       => 'Support Message',
            'target_type'  => 'support',
            'target_id'    => $request->user()->id,
            'details'      => $request->message,
            'performed_by' => $request->name . ' (' . $request->email . ')',
            'ip_address'   => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Support message sent successfully.',
        ], 201);
    }
}
