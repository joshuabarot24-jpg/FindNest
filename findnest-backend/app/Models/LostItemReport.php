<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LostItemReport extends Model
{
    protected $fillable = [
        'user_id',
        'item_name',
        'category',
        'description',
        'location_lost',
        'date_lost',
        'photo_url',
        'status',
        'ai_description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function aiMatches()
    {
        return $this->hasMany(AiMatch::class, 'report_id');
    }

    public function locationLogs()
    {
        return $this->hasMany(LocationLog::class, 'report_id');
    }
}
