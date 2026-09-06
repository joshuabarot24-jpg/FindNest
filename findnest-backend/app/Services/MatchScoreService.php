<?php
namespace App\Services;

use App\Models\LostItemReport;
use App\Models\FoundItemRecord;
use App\Models\AiMatch;
use App\Models\Notification;
use App\Models\AuditLog;
use App\Services\FcmService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MatchScoreService
{
    protected $apiKey;
    protected $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    public function checkNewLostReport(LostItemReport $report)
    {
        $candidates = FoundItemRecord::where('status', 'unclaimed')
            ->get();

        foreach ($candidates as $found) {
            $this->evaluatePair($report, $found);
        }
    }

    public function checkNewFoundRecord(FoundItemRecord $found)
    {
        $candidates = LostItemReport::where('status', 'searching')
            ->get();

        foreach ($candidates as $report) {
            $this->evaluatePair($report, $found);
        }
    }

    protected function evaluatePair(LostItemReport $report, FoundItemRecord $found)
    {
        $existing = AiMatch::where('report_id', $report->id)
            ->where('found_id', $found->id)
            ->first();

        if ($existing) {
            return;
        }

        $descriptionScore = $this->compareDescriptions(
            $report->ai_description ?: $report->description,
            $found->ai_description ?: $found->description
        );

        $categoryScore = ($report->category === $found->category) ? 100 : 0;

        $temporalSpatialScore = $this->calculateTemporalSpatialScore($report, $found);

        $finalScore = round(
            ($descriptionScore * 0.6) +
            ($categoryScore * 0.2) +
            ($temporalSpatialScore * 0.2)
        );

        $matchStatus = $finalScore < 50 ? null : 'pending';

        if ($matchStatus === null) {
            return;
        }

        $match = AiMatch::create([
            'report_id' => $report->id,
            'found_id' => $found->id,
            'confidence_score' => $finalScore,
            'attributes' => json_encode([
                'description_score' => $descriptionScore,
                'category_score' => $categoryScore,
                'temporal_spatial_score' => $temporalSpatialScore,
            ]),
            'match_status' => $matchStatus,
            'matched_at' => Carbon::now(),
        ]);

        AuditLog::create([
            'user_id' => $report->user_id,
            'action' => 'AI Match Generated',
            'target_type' => 'ai_matches',
            'target_id' => $match->id,
            'details' => 'AI matched "' . $report->item_name . '" with found item "' . $found->item_name . '" at ' . $finalScore . '% confidence',
            'performed_by' => 'System: AI Matching Engine',
            'ip_address' => request()->ip() ?? 'system',
        ]);

        if ($finalScore >= 80) {
            $this->notifyStudent($report, $found, $finalScore);
        }
    }

    protected function compareDescriptions(?string $descriptionA, ?string $descriptionB): int
    {
        if (empty($descriptionA) || empty($descriptionB)) {
            return 0;
        }

        try {
            $response = Http::timeout(20)->post($this->apiUrl . '?key=' . $this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => "Compare these two item descriptions and rate how likely they describe the SAME physical item, on a scale of 0 to 100. Consider color, brand, material, distinctive markings, and overall similarity. Respond with ONLY a JSON object in this exact format, no other text: {\"similarity_score\": number from 0 to 100}\n\nDescription A: {$descriptionA}\n\nDescription B: {$descriptionB}"
                            ]
                        ]
                    ]
                ]
            ]);

            if (!$response->successful()) {
                Log::error('Description comparison failed: ' . $response->body());
                return 0;
            }

            $data = $response->json();
            $textResult = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $cleanedText = trim(preg_replace('/```json\s*|\s*```/', '', $textResult));

            $result = json_decode($cleanedText, true);

            return is_array($result) && isset($result['similarity_score'])
                ? (int) $result['similarity_score']
                : 0;
        } catch (\Exception $e) {
            Log::error('Description comparison exception: ' . $e->getMessage());
            return 0;
        }
    }

    protected function calculateTemporalSpatialScore(LostItemReport $report, FoundItemRecord $found): int
    {
        $daysDiff = abs(Carbon::parse($report->date_lost)->diffInDays(Carbon::parse($found->date_found)));

        if ($daysDiff <= 1) {
            $dateScore = 100;
        } elseif ($daysDiff <= 3) {
            $dateScore = 75;
        } elseif ($daysDiff <= 7) {
            $dateScore = 50;
        } else {
            $dateScore = 20;
        }

        $locationA = strtolower(trim($report->location_lost));
        $locationB = strtolower(trim($found->location_found));

        similar_text($locationA, $locationB, $locationPercent);

        return (int) round(($dateScore + $locationPercent) / 2);
    }

    protected function notifyStudent(LostItemReport $report, FoundItemRecord $found, int $score)
    {
        Notification::create([
            'user_id' => $report->user_id,
            'match_id' => null,
            'title' => 'Possible Match Found!',
            'message' => 'We found a ' . $score . '% match for your lost "' . $report->item_name . '". Check Claim Status to view the details.',
            'type' => 'match',
            'is_read' => false,
            'sent_at' => Carbon::now(),
        ]);

        $student = \App\Models\User::find($report->user_id);
        if ($student && $student->fcm_token) {
            $fcm = new FcmService();
            $fcm->sendToUser(
                $student->fcm_token,
                'Possible Match Found',
                'We found a ' . $score . '% match for your lost "' . $report->item_name . '".',
                ['type' => 'ai_match', 'report_id' => (string) $report->id]
            );
        }
    }
}
