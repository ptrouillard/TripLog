<?php
$configPath = __DIR__ . '/api/config.php';
$configLoaded = false;
$errorMessage = null;
$errorCode = null;
$testSucceeded = false;

if (file_exists($configPath)) {
    require $configPath;
    $configLoaded = true;
} else {
    $errorMessage = 'Config file not found: api/config.php';
}

$requiredKeys = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS'];
$missingKeys = [];

if ($configLoaded) {
    foreach ($requiredKeys as $key) {
        if (!defined($key)) {
            $missingKeys[] = $key;
        }
    }
}

if ($configLoaded && empty($missingKeys)) {
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        $pdo->query('SELECT 1');
        $testSucceeded = true;
    } catch (Throwable $exception) {
        $errorMessage = $exception->getMessage();
        $errorCode = (string)$exception->getCode();
    }
}

function esc(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TripLog - Test connexion DB</title>
    <style>
      :root {
        --ok: #54d39a;
        --ko: #ff8d9a;
        --bg: #07131f;
        --card: #0f2236;
        --line: rgba(255, 255, 255, 0.18);
        --text: #eaf3ff;
        --muted: #b8c8de;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: Segoe UI, Arial, sans-serif;
        color: var(--text);
        background: radial-gradient(circle at 20% 10%, #284866, transparent 35%),
          linear-gradient(140deg, var(--bg), #0a1a2b);
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 1rem;
      }

      .card {
        width: min(840px, 96vw);
        border: 1px solid var(--line);
        border-radius: 14px;
        background: var(--card);
        padding: 1rem;
      }

      h1 {
        margin: 0 0 0.6rem;
      }

      .status {
        border-radius: 10px;
        padding: 0.75rem;
        font-weight: 700;
        margin-bottom: 0.8rem;
      }

      .ok {
        background: rgba(84, 211, 154, 0.16);
        border: 1px solid rgba(84, 211, 154, 0.42);
        color: var(--ok);
      }

      .ko {
        background: rgba(255, 141, 154, 0.15);
        border: 1px solid rgba(255, 141, 154, 0.4);
        color: var(--ko);
      }

      dl {
        margin: 0;
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: 0.4rem 0.6rem;
      }

      dt {
        color: var(--muted);
      }

      code {
        background: rgba(255, 255, 255, 0.08);
        padding: 0.12rem 0.35rem;
        border-radius: 6px;
      }

      .hint {
        color: var(--muted);
        margin-top: 0.8rem;
        font-size: 0.94rem;
      }

      .actions {
        margin-top: 0.9rem;
      }

      .btn {
        display: inline-block;
        text-decoration: none;
        border: 1px solid var(--line);
        color: var(--text);
        border-radius: 999px;
        padding: 0.45rem 0.8rem;
      }
    </style>
  </head>
  <body>
    <section class="card">
      <h1>Test connexion base de donnees</h1>

      <?php if (!$configLoaded): ?>
        <p class="status ko">ECHEC: impossible de charger api/config.php</p>
      <?php elseif (!empty($missingKeys)): ?>
        <p class="status ko">ECHEC: constantes manquantes dans api/config.php</p>
      <?php elseif ($testSucceeded): ?>
        <p class="status ok">OK: connexion a la base reussie.</p>
      <?php else: ?>
        <p class="status ko">ECHEC: erreur de connexion a la base.</p>
      <?php endif; ?>

      <dl>
        <dt>Config chargee</dt>
        <dd><?php echo $configLoaded ? 'oui' : 'non'; ?></dd>

        <dt>Host</dt>
        <dd><?php echo defined('DB_HOST') ? esc((string)DB_HOST) : '-'; ?></dd>

        <dt>Port</dt>
        <dd><?php echo defined('DB_PORT') ? esc((string)DB_PORT) : '-'; ?></dd>

        <dt>Base</dt>
        <dd><?php echo defined('DB_NAME') ? esc((string)DB_NAME) : '-'; ?></dd>

        <dt>Utilisateur</dt>
        <dd><?php echo defined('DB_USER') ? esc((string)DB_USER) : '-'; ?></dd>

        <dt>DSN</dt>
        <dd><code><?php echo isset($dsn) ? esc($dsn) : '-'; ?></code></dd>

        <dt>Constantes manquantes</dt>
        <dd><?php echo empty($missingKeys) ? 'aucune' : esc(implode(', ', $missingKeys)); ?></dd>

        <dt>Code erreur</dt>
        <dd><?php echo $errorCode !== null ? esc($errorCode) : '-'; ?></dd>

        <dt>Message erreur</dt>
        <dd><?php echo $errorMessage !== null ? esc($errorMessage) : '-'; ?></dd>
      </dl>

      <p class="hint">
        Conseil: supprime ou protege cette page apres validation en production, car elle expose des informations techniques.
      </p>

      <div class="actions">
        <a class="btn" href="admin.html">Retour admin</a>
      </div>
    </section>
  </body>
</html>
