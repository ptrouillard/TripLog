<?php
require_once __DIR__ . '/db.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    json_response(405, [
        'ok' => false,
        'error' => 'Method not allowed.',
    ]);
}

require_authentication();

if (!isset($_FILES['image'])) {
    json_response(422, [
        'ok' => false,
        'error' => 'No file uploaded.',
    ]);
}

$file = $_FILES['image'];
if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    json_response(422, [
        'ok' => false,
        'error' => 'Upload failed.',
    ]);
}

$maxBytes = 8 * 1024 * 1024;
$size = (int)($file['size'] ?? 0);
if ($size <= 0 || $size > $maxBytes) {
    json_response(422, [
        'ok' => false,
        'error' => 'Invalid file size (max 8 MB).',
    ]);
}

$tmpName = (string)$file['tmp_name'];
$mimeType = mime_content_type($tmpName) ?: '';
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];

if (!isset($allowed[$mimeType])) {
    json_response(422, [
        'ok' => false,
        'error' => 'Unsupported image format.',
    ]);
}

$extension = $allowed[$mimeType];
$baseName = pathinfo((string)($file['name'] ?? 'image'), PATHINFO_FILENAME);
$baseName = preg_replace('/[^a-z0-9]+/i', '-', strtolower($baseName));
$baseName = trim((string)$baseName, '-');
if ($baseName === '') {
    $baseName = 'trip';
}

$fileName = sprintf('%s-%s.%s', $baseName, bin2hex(random_bytes(6)), $extension);
$uploadDir = dirname(__DIR__) . '/uploads';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
    json_response(500, [
        'ok' => false,
        'error' => 'Unable to create upload directory.',
    ]);
}

$target = $uploadDir . '/' . $fileName;
if (!move_uploaded_file($tmpName, $target)) {
    json_response(500, [
        'ok' => false,
        'error' => 'Unable to save uploaded file.',
    ]);
}

json_response(200, [
    'ok' => true,
    'data' => [
        'url' => 'uploads/' . $fileName,
    ],
]);
