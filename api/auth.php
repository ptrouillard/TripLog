<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    json_response(200, [
        'ok' => true,
        'data' => [
            'authenticated' => is_authenticated(),
        ],
    ]);
}

if ($method === 'POST') {
    $payload = get_json_body();
    $action = (string)($payload['action'] ?? 'login');

    if ($action === 'logout') {
        ensure_session_started();
        $_SESSION = [];
        session_destroy();

        json_response(200, [
            'ok' => true,
            'data' => ['authenticated' => false],
        ]);
    }

    $username = trim((string)($payload['username'] ?? ''));
    $password = (string)($payload['password'] ?? '');

    $isValid = hash_equals(ADMIN_USERNAME, $username) && hash_equals(ADMIN_PASSWORD, $password);
    if (!$isValid) {
        json_response(401, [
            'ok' => false,
            'error' => 'Invalid credentials.',
        ]);
    }

    ensure_session_started();
    $_SESSION['triplog_auth'] = true;
    $_SESSION['triplog_user'] = ADMIN_USERNAME;

    json_response(200, [
        'ok' => true,
        'data' => ['authenticated' => true],
    ]);
}

json_response(405, [
    'ok' => false,
    'error' => 'Method not allowed.',
]);
