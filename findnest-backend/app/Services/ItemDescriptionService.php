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

            $response = Http::timeout(20)->retry(3, 2000)->post($this->apiUrl . '?key=' . $this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            [
                               'text' => 'Look at this image carefully. First, determine if it shows a physical, identifiable lost-and-found type item (such as electronics, wallets, bags, clothing, accessories, keys, ID cards, school supplies, water bottles, etc). The item may be photographed alone, or it may be worn on a person\'s body or attached to something (e.g. a watch on a wrist, a bag on a shoulder, an ID on a lanyard, a phone in a hand) — these still count as a valid identifiable item; focus on and describe the item itself, not the person. Screenshots, selfies with no item focus, documents, or unrelated random photos do NOT count as identifiable items. Second, count how many distinct separate lost-and-found-type items are clearly visible in the photo (not counting the background or unrelated clutter). If more than one distinct item is the clear subject of the photo (e.g. several unrelated items laid out together), this is NOT acceptable for a single item report. If a single clear item IS shown, generate a structured description AND a short, specific item name a student would naturally type themselves (e.g. "Black Nike Backpack", "Silver Apple Watch", "Blue Umbrella with Wooden Handle") — include a distinguishing color or brand if visible, keep it under 6 words. Respond with ONLY a JSON object in this exact format, no other text, no markdown: {"item_detected": true or false, "multiple_items_detected": true or false, "item_name": "short specific item name, or empty string if not detected", "category": "one of: Electronics, Personal Belongings, ID/Cards, Keys, School Supplies, Accessories, Others, or empty string if not detected", "primary_color": "string or empty", "secondary_color": "string or empty", "brand_or_markings": "string or empty", "materials": "string or empty", "distinctive_features": "string describing scratches, stickers, keychains, or other unique details, or empty", "summary": "one paragraph natural language description combining all details, or empty if no item detected"}'
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

            if (($result['multiple_items_detected'] ?? false) === true) {
                return [
                    'success' => true,
                    'item_detected' => false,
                    'message' => 'This photo appears to show multiple items. Please upload a photo focused on just one item at a time.',
                ];
            }

            return [
                'success' => true,
                'item_detected' => true,
                'item_name' => $result['item_name'] ?? '',
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
