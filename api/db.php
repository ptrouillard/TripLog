<?php
require_once __DIR__ . '/config.php';

function json_response(int $statusCode, array $payload): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function ensure_session_started(): void {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

function is_authenticated(): bool {
    ensure_session_started();
    return isset($_SESSION['triplog_auth']) && $_SESSION['triplog_auth'] === true;
}

function require_authentication(): void {
    if (!is_authenticated()) {
        json_response(401, [
            'ok' => false,
            'error' => 'Authentication required.',
        ]);
    }
}

function get_json_body(): array {
    $body = file_get_contents('php://input');
    $payload = json_decode($body ?: '{}', true);

    if (!is_array($payload)) {
        json_response(400, [
            'ok' => false,
            'error' => 'Invalid JSON payload.',
        ]);
    }

    return $payload;
}

function get_pdo(): PDO {
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        DB_HOST,
        DB_PORT,
        DB_NAME
    );

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (Throwable $error) {
        json_response(500, [
            'ok' => false,
            'error' => 'Database connection failed. Check api/config.php.',
            'details' => $error->getMessage(),
        ]);
    }

    return $pdo;
}

function ensure_schema(PDO $pdo): void {
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS trips (
            id VARCHAR(80) NOT NULL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            trip_date VARCHAR(120) NOT NULL,
            location VARCHAR(255) NOT NULL,
            image_url TEXT NOT NULL,
            video_url TEXT DEFAULT NULL,
            content LONGTEXT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
}

function normalize_id(string $title, ?string $forcedId = null): string {
    if ($forcedId !== null && trim($forcedId) !== '') {
        return preg_replace('/[^a-z0-9-]/', '-', strtolower(trim($forcedId)));
    }

    $title = trim(mb_strtolower($title, 'UTF-8'));
    $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $title);
    if ($ascii === false) {
        $ascii = $title;
    }

    $slug = preg_replace('/[^a-z0-9]+/', '-', $ascii);
    $slug = trim($slug, '-');

    if ($slug === '') {
        $slug = 'voyage-' . time();
    }

    return substr($slug, 0, 80);
}

function map_trip(array $row): array {
    return [
        'id' => $row['id'],
        'title' => $row['title'],
        'date' => $row['trip_date'],
        'location' => $row['location'],
        'image' => $row['image_url'],
        'video' => $row['video_url'] ?? '',
        'content' => $row['content'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
    ];
}
