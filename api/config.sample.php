<?php
// ==============================================================
// MODELE DE CONFIGURATION — ne mettez jamais vos vraies valeurs
// dans ce fichier. Il est commite dans git uniquement comme exemple.
//
// Usage local :
//   cp api/config.sample.php api/config.php
//   vim api/config.php   # remplissez vos valeurs
//
// Usage production :
//   Les secrets sont stockes dans GitHub Actions Secrets et ce
//   fichier est genere automatiquement lors du deploiement.
//   Voir .github/workflows/deploy.yml
// ==============================================================
define('DB_HOST',        'localhost');
define('DB_PORT',        '3306');
define('DB_NAME',        'VOTRE_NOM_BASE');
define('DB_USER',        'VOTRE_UTILISATEUR');
define('DB_PASS',        'VOTRE_MOT_DE_PASSE');
define('ADMIN_USERNAME', 'VOTRE_LOGIN_ADMIN');
define('ADMIN_PASSWORD', 'VOTRE_MOT_DE_PASSE_ADMIN');
