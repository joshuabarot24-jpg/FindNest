<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupportController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message = SupportMessage::create([
            'name' => $request->name,
            'email' => $request->email,
            'message' => $request->message,
            'status' => 'new',
        ]);

        return response()->json([
            'message' => 'Support message sent successfully',
            'data' => $message,
        ], 201);
    }

    public function index()
    {
        $messages = SupportMessage::orderBy('created_at', 'desc')->get();
        return response()->json(['messages' => $messages]);
    }

    public function markAsRead($id)
    {
        $message = SupportMessage::findOrFail($id);
        $message->update(['status' => 'read']);
        return response()->json(['message' => 'Marked as read', 'data' => $message]);
    }
}
