<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class UploadController extends Controller
{
    public function uploadImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240',
            'folder' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $uploadedFile = Cloudinary::uploadApi()->upload(
            $request->file('image')->getRealPath(),
        [
            'folder' => 'findnest/' . ($request->folder ?? 'items'),
            'transformation' => [
                'quality' => 'auto',
                'fetch_format' => 'auto',
            ],
        ]
);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'url' => $uploadedFile['secure_url'],
            'public_id' => $uploadedFile['public_id'],
        ]);
    }

    public function deleteImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'public_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        Cloudinary::uploadApi()->destroy($request->public_id);

        return response()->json(['message' => 'Image deleted successfully']);
    }
}
