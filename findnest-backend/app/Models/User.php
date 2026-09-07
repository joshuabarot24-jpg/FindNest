<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'school_id',
        'course',
        'year_level',
        'education_level',
        'is_active',
        'otp_code',
        'otp_expires_at',
        'trust_score',
        'fcm_token',
        'privileges',
        'is_restricted',
        'restriction_reason',
        'restricted_until',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'otp_expires_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'privileges' => 'array',
        'is_restricted' => 'boolean',
        'restricted_until' => 'date',
    ];

    public function lostReports()
    {
        return $this->hasMany(LostItemReport::class, 'user_id');
    }

    public function claims()
    {
        return $this->hasMany(Claim::class, 'student_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class, 'user_id');
    }
}
