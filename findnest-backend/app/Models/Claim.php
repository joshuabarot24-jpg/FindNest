<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Claim extends Model
{
    protected $fillable = [
        'match_id',
        'student_id',
        'admin_id',
        'proof_description',
        'proof_photo_url',
        'claim_status',
        'admin_notes',
        'claimed_at',
    ];

    protected $casts = [
        'claimed_at' => 'datetime',
    ];

    public function match()
    {
        return $this->belongsTo(AiMatch::class, 'match_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
