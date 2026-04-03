<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = get_pdo();
ensure_schema($pdo);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM trips ORDER BY updated_at DESC');
    $rows = $stmt->fetchAll();
    $trips = array_map('map_trip', $rows);

    json_response(200, [
        'ok' => true,
        'data' => $trips,
    ]);
}

if ($method === 'POST') {
    require_authentication();
    $payload = get_json_body();

    $title = trim((string)($payload['title'] ?? ''));
    $date = trim((string)($payload['date'] ?? ''));
    $location = trim((string)($payload['location'] ?? ''));
    $image = trim((string)($payload['image'] ?? ''));
    $video = trim((string)($payload['video'] ?? ''));
    $content = trim((string)($payload['content'] ?? ''));

    if ($title === '' || $date === '' || $location === '' || $content === '') {
        json_response(422, ['ok' => false, 'error' => 'Missing required fields.']);
    }

    $id = normalize_id($title, isset($payload['id']) ? (string)$payload['id'] : null);

    $sql = 'INSERT INTO trips (id, title, trip_date, location, image_url, video_url, content)
            VALUES (:id, :title, :trip_date, :location, :image_url, :video_url, :content)
            ON DUPLICATE KEY UPDATE
              title = VALUES(title),
              trip_date = VALUES(trip_date),
              location = VALUES(location),
              image_url = VALUES(image_url),
              video_url = VALUES(video_url),
              content = VALUES(content),
              updated_at = CURRENT_TIMESTAMP';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $id,
        ':title' => $title,
        ':trip_date' => $date,
        ':location' => $location,
        ':image_url' => $image,
        ':video_url' => $video !== '' ? $video : null,
        ':content' => $content,
    ]);

    $readStmt = $pdo->prepare('SELECT * FROM trips WHERE id = :id LIMIT 1');
    $readStmt->execute([':id' => $id]);
    $saved = $readStmt->fetch();

    if (!$saved) {
        json_response(500, ['ok' => false, 'error' => 'Unable to read saved post.']);
    }

    json_response(200, [
        'ok' => true,
        'data' => map_trip($saved),
    ]);
}

if ($method === 'DELETE') {
    require_authentication();
    $id = trim((string)($_GET['id'] ?? ''));
    if ($id === '') {
        json_response(422, ['ok' => false, 'error' => 'Missing post id.']);
    }

    $stmt = $pdo->prepare('DELETE FROM trips WHERE id = :id');
    $stmt->execute([':id' => $id]);

    json_response(200, ['ok' => true]);
}

json_response(405, ['ok' => false, 'error' => 'Method not allowed.']);
