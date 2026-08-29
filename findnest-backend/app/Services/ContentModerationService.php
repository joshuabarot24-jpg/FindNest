<?php
namespace App\Services;

use Google\Cloud\Vision\V1\Client\ImageAnnotatorClient;
use Google\Cloud\Vision\V1\AnnotateImageRequest;
use Google\Cloud\Vision\V1\Feature;
use Google\Cloud\Vision\V1\Feature\Type;
use Google\Cloud\Vision\V1\Image;
use Google\Cloud\Vision\V1\Likelihood;

class ContentModerationService
{
    protected $client;

    public function __construct()
    {
        $credentialsPath = base_path(env('GOOGLE_CLOUD_VISION_CREDENTIALS'));

        $this->client = new ImageAnnotatorClient([
            'credentials' => $credentialsPath,
        ]);
    }

    public function checkImage(string $imageUrl): array
    {
        try {
            $image = (new Image())->setContent(file_get_contents($imageUrl));

            $feature = (new Feature())->setType(Type::SAFE_SEARCH_DETECTION);

            $request = (new AnnotateImageRequest())
                ->setImage($image)
                ->setFeatures([$feature]);

            $response = $this->client->annotateImage($request);
            $safeSearch = $response->getSafeSearchAnnotation();

            $flaggedCategories = [];

            $checks = [
                'adult' => $safeSearch->getAdult(),
                'violence' => $safeSearch->getViolence(),
                'racy' => $safeSearch->getRacy(),
                'medical' => $safeSearch->getMedical(),
                'spoof' => $safeSearch->getSpoof(),
            ];

            foreach ($checks as $category => $likelihood) {
                if ($likelihood === Likelihood::LIKELY || $likelihood === Likelihood::VERY_LIKELY) {
                    $flaggedCategories[] = $category;
                }
            }

            return [
                'passed' => count($flaggedCategories) === 0,
                'flagged_categories' => $flaggedCategories,
                'message' => count($flaggedCategories) > 0
                    ? 'This image was flagged as inappropriate (' . implode(', ', $flaggedCategories) . '). Please upload a different photo.'
                    : 'Image passed content moderation.',
            ];
        } catch (\Exception $e) {
            \Log::error('Content moderation check failed: ' . $e->getMessage());
            return [
                'passed' => false,
                'flagged_categories' => [],
                'message' => 'We could not verify this image right now. Please try again in a moment.',
            ];
        } finally {
            $this->client->close();
        }
    }
}
