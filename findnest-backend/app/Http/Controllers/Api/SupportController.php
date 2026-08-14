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
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'message' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        SupportMessage::create([
            'user_id' => $request->user()->id,
            'name'    => $request->name,
            'email'   => $request->email,
            'message' => $request->message,
            'status'  => 'new',
        ]);

        return response()->json([
            'message' => 'Support message sent successfully.',
        ], 201);
    }
}
