<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ItemDescriptionService
{
    protected $apiKey;
    protected $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    public function analyzeImage(string $imageUrl): array
    {
        try {
            $imageContent = file_get_contents($imageUrl);
            $base64Image = base64_encode($imageContent);

            $response = Http::timeout(30)->post($this->apiUrl . '?key=' . $this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => 'Look at this image carefully. First, determine if it shows a physical, identifiable lost-and-found type item (such as electronics, wallets, bags, clothing, accessories, keys, ID cards, school supplies, water bottles, etc). Screenshots, body parts, selfies, documents, or unrelated random photos do NOT count as identifiable items. If a clear item IS shown, generate a structured description. Respond with ONLY a JSON object in this exact format, no other text, no markdown: {"item_detected": true or false, "category": "one of: Electronics, Personal Belongings, ID/Cards, Keys, School Supplies, Accessories, Others, or empty string if not detected", "primary_color": "string or empty", "secondary_color": "string or empty", "brand_or_markings": "string or empty", "materials": "string or empty", "distinctive_features": "string describing scratches, stickers, keychains, or other unique details, or empty", "summary": "one paragraph natural language description combining all details, or empty if no item detected"}'
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
                Log::error('Item description generation failed: ' . $response->body());
                return [
                    'success' => false,
                    'item_detected' => false,
                    'message' => 'We could not analyze this image right now. Please try again in a moment.',
                ];
            }

            $data = $response->json();
            $textResult = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

            $cleanedText = preg_replace('/```json\s*|\s*```/', '', $textResult);
            $cleanedText = trim($cleanedText);

            $result = json_decode($cleanedText, true);

            if (!is_array($result) || !isset($result['item_detected'])) {
                Log::error('Item description returned unexpected format: ' . $textResult);
                return [
                    'success' => false,
                    'item_detected' => false,
                    'message' => 'We could not analyze this image right now. Please try again in a moment.',
                ];
            }

            if ($result['item_detected'] !== true) {
                return [
                    'success' => true,
                    'item_detected' => false,
                    'message' => 'We could not identify a lost-and-found item in this photo. Please upload a clear photo of the actual item.',
                ];
            }

            return [
                'success' => true,
                'item_detected' => true,
                'category' => $result['category'] ?? '',
                'ai_description' => $result['summary'] ?? '',
                'details' => [
                    'primary_color' => $result['primary_color'] ?? '',
                    'secondary_color' => $result['secondary_color'] ?? '',
                    'brand_or_markings' => $result['brand_or_markings'] ?? '',
                    'materials' => $result['materials'] ?? '',
                    'distinctive_features' => $result['distinctive_features'] ?? '',
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Item description generation failed: ' . $e->getMessage());
            return [
                'success' => false,
                'item_detected' => false,
                'message' => 'We could not analyze this image right now. Please try again in a moment.',
            ];
        }
    }
}
