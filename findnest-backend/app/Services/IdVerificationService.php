<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IdVerificationService
{
    protected $apiKey;
    protected $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    public function extractIdInfo(string $imageUrl): array
    {
        try {
            $imageContent = file_get_contents($imageUrl);
            $base64Image = base64_encode($imageContent);

            $response = Http::timeout(20)->retry(3, 2000)->post($this->apiUrl . '?key=' . $this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => 'Look at this school ID card image. Extract the following information exactly as printed: the student\'s full name, and their student ID number (usually formatted like numbers with dashes, e.g. 2022-10043). Respond with ONLY a JSON object in this exact format, no other text: {"id_detected": true or false, "name": "extracted full name or empty string", "school_id": "extracted ID number or empty string"}'
                            ],
                            [
                                'inline_data' => [
                                    'mime_type' => 'image/jpeg',
                                    'data' => $base64Image,
                                ]
                            ]
                        ]
                    ]
                ]
            ]);

            if (!$response->successful()) {
                Log::error('ID extraction failed: ' . $response->body());
                return ['success' => false, 'message' => 'Could not read the ID photo. Please try again with a clearer image.'];
            }

            $data = $response->json();
            $textResult = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $cleanedText = trim(preg_replace('/```json\s*|\s*```/', '', $textResult));
            $result = json_decode($cleanedText, true);

            if (!is_array($result) || !isset($result['id_detected'])) {
                Log::error('ID extraction returned unexpected format: ' . $textResult);
                return ['success' => false, 'message' => 'Could not read the ID photo. Please try again.'];
            }

            if ($result['id_detected'] !== true) {
                return ['success' => false, 'message' => 'We could not detect a valid school ID in this photo. Please upload a clear photo of your ID.'];
            }

            return [
                'success' => true,
                'name' => $result['name'] ?? '',
                'school_id' => $result['school_id'] ?? '',
            ];
        } catch (\Exception $e) {
            Log::error('ID extraction exception: ' . $e->getMessage());
            return ['success' => false, 'message' => 'We could not analyze this ID right now. Please try again.'];
        }
    }

    public function compareToAccount(string $extractedName, string $extractedSchoolId, string $accountName, ?string $accountSchoolId): string
    {
        $normalize = fn($s) => strtolower(trim(preg_replace('/\s+/', ' ', $s)));

        $nameMatches = $normalize($extractedName) === $normalize($accountName);
        $idMatches = $accountSchoolId && $normalize($extractedSchoolId) === $normalize($accountSchoolId);

        if ($nameMatches && $idMatches) {
            return 'matched';
        }
        if (!$nameMatches && !$idMatches) {
            return 'mismatch';
        }
        return 'partial';
    }
}
