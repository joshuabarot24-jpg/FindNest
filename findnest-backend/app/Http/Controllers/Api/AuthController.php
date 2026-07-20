<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function superAdminLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)
            ->where('role', 'super_admin')
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Account is deactivated'], 403);
        }

        $token = $user->createToken('super-admin-token')->plainTextToken;

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'Super Admin Login',
            'target_type' => 'users',
            'target_id' => $user->id,
            'details' => 'Super Admin logged in successfully',
            'performed_by' => 'Super Admin: ' . $user->name,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    public function adminLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)
            ->where('role', 'admin')
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Account is deactivated'], 403);
        }

        $token = $user->createToken('admin-token')->plainTextToken;

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'Admin Login',
            'target_type' => 'users',
            'target_id' => $user->id,
            'details' => 'Admin logged in successfully',
            'performed_by' => 'Admin: ' . $user->name,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }

    public function studentLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_id' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('school_id', $request->school_id)
            ->where('role', 'student')
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Account is deactivated'], 403);
        }

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update([
            'otp_code' => $otp,
            'otp_expires_at' => Carbon::now()->addMinutes(10),
        ]);

        Mail::raw("Your FindNest OTP code is: $otp\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone.", function ($message) use ($user) {
            $message->to($user->email)
                ->subject('FindNest — Your OTP Verification Code');
        });

        return response()->json([
            'message' => 'OTP sent to your registered email',
            'email' => substr($user->email, 0, 3) . '****@' . explode('@', $user->email)[1],
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_id' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('school_id', $request->school_id)
            ->where('role', 'student')
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        if ($user->otp_code !== $request->otp) {
            return response()->json(['message' => 'Invalid OTP code'], 401);
        }

        if (Carbon::now()->isAfter($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 401);
        }

        $user->update([
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        $token = $user->createToken('student-token')->plainTextToken;

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'Student Login',
            'target_type' => 'users',
            'target_id' => $user->id,
            'details' => 'Student verified OTP and logged in successfully',
            'performed_by' => 'Student: ' . $user->name,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'school_id' => $user->school_id,
                'course' => $user->course,
                'year_level' => $user->year_level,
                'trust_score' => $user->trust_score,
            ]
        ]);
    }

    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('school_id', $request->school_id)
            ->where('role', 'student')
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update([
            'otp_code' => $otp,
            'otp_expires_at' => Carbon::now()->addMinutes(10),
        ]);

        Mail::raw("Your FindNest OTP code is: $otp\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone.", function ($message) use ($user) {
            $message->to($user->email)
                ->subject('FindNest — Your OTP Verification Code');
        });

        return response()->json([
            'message' => 'New OTP sent to your registered email',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }
}
