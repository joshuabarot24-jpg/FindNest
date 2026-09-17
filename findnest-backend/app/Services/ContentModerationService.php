<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ContentModerationService
{
    protected $apiKey;
    protected $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    public function checkImage(string $imageUrl): array
    {
        try {
            $imageContent = file_get_contents($imageUrl);
            $base64Image = base64_encode($imageContent);

            $response = Http::timeout(20)->retry(3, 2000)->post($this->apiUrl . '?key=' . $this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => 'Analyze this image and determine if it contains inappropriate content (nudity, violence, graphic content, offensive material, or anything unsuitable for a school lost-and-found system). Respond with ONLY a JSON object in this exact format, no other text: {"appropriate": true or false, "reason": "brief explanation if inappropriate, or empty string if appropriate"}'
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
                Log::error('Gemini content check failed: ' . $response->body());
                return [
                    'passed' => false,
                    'message' => 'We could not verify this image right now. Please try again in a moment.',
                ];
            }

            $data = $response->json();
            $textResult = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

            $cleanedText = preg_replace('/```json\s*|\s*```/', '', $textResult);
            $cleanedText = trim($cleanedText);

            $result = json_decode($cleanedText, true);

            if (!is_array($result) || !isset($result['appropriate'])) {
                Log::error('Gemini content check returned unexpected format: ' . $textResult);
                return [
                    'passed' => false,
                    'message' => 'We could not verify this image right now. Please try again in a moment.',
                ];
            }

            return [
                'passed' => $result['appropriate'] === true,
                'message' => $result['appropriate'] === true
                    ? 'Image passed content moderation.'
                    : 'This image was flagged as inappropriate' . (!empty($result['reason']) ? ': ' . $result['reason'] : '') . '. Please upload a different photo.',
            ];
        } catch (\Exception $e) {
            Log::error('Content moderation check failed: ' . $e->getMessage());
            return [
                'passed' => false,
                'message' => 'We could not verify this image right now. Please try again in a moment.',
            ];
        }
    }
}
