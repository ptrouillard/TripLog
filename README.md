# TripLog

Site vitrine de blog de voyages en HTML/CSS/JS vanilla.

## Fonctionnalites

- Page hero avec direction artistique voyage
- Timeline de recits avec photos
- Integration video par etape
- Back office dedie pour creer, modifier et supprimer les voyages
- Editeur WYSIWYG (rich text) pour le contenu des recits
- Responsive mobile et desktop
- Base MySQL/MariaDB via API PHP (compatible o2switch)
- Fallback localStorage si l API n est pas disponible

## Stack de persistance

- Base cible: MySQL/MariaDB
- API: PHP + PDO (`api/posts.php`)
- Hebergement cible: o2switch (LAMP, MySQL, PHP, phpMyAdmin)
- Auth back office: session PHP (`api/auth.php`)
- Upload images: endpoint securise (`api/upload.php`)

## Lancer le site en local

Option simple:

1. Ouvrez le dossier dans VS Code.
2. Installez l extension Live Server.
3. Lancez `index.html` avec Live Server.

Option terminal (Python installe):

1. Depuis la racine du projet, lancez:

```bash
python -m http.server 5500
```

2. Ouvrez ensuite `http://localhost:5500` dans le navigateur.

Note: avec ce mode Python, l API PHP ne tourne pas. Le site bascule automatiquement sur le fallback localStorage.

Option terminal PHP (pour tester la base en local):

1. Depuis la racine du projet, lancez:

```bash
php -S localhost:8000
```

2. Ouvrez `http://localhost:8000`.

## Utiliser le back office

1. Ouvrez `http://localhost:5500/admin.html`.
2. Selectionnez un voyage dans la colonne de gauche, ou cliquez sur `Nouveau`.
3. Modifiez les champs et le contenu riche dans l editeur.
4. Cliquez sur `Enregistrer`.
5. Revenez sur `index.html` pour voir le rendu public.

## Configurer la base de donnees (o2switch)

1. Dans cPanel o2switch, creez une base MySQL et un utilisateur avec tous les droits sur cette base.
2. Ouvrez `api/config.php` et renseignez:
	- `DB_HOST` (souvent `localhost`)
	- `DB_PORT` (`3306`)
	- `DB_NAME`
	- `DB_USER`
	- `DB_PASS`
	- `ADMIN_USERNAME`
	- `ADMIN_PASSWORD`
3. Importez `api/schema.sql` via phpMyAdmin (ou laissez l API creer la table automatiquement).
4. Deployez le projet sur l hebergement (dossier public_html ou sous-dossier).
5. Testez l endpoint: `https://votre-domaine.tld/api/posts.php`

Si tout est correct, `GET /api/posts.php` retourne un JSON avec `ok: true`.

## Authentification admin

- Acces admin: `admin.html`
- Login verifie par `api/auth.php` avec session PHP
- Les routes sensibles (`POST`/`DELETE` sur `api/posts.php` et upload via `api/upload.php`) exigent une session valide

Pensez a changer les valeurs par defaut de `ADMIN_USERNAME` et `ADMIN_PASSWORD` avant mise en production.

## Upload d images

- Endpoint: `POST /api/upload.php`
- Champ attendu: `image` (multipart/form-data)
- Formats autorises: jpg, png, webp, gif
- Taille max: 8 MB
- Fichiers stockes dans `uploads/` puis URL renvoyee au back office

## Personnalisation rapide

- Le connecteur de donnees est dans `store.js`.
- Les endpoints back sont dans `api/posts.php` et `api/db.php`.
- Les couleurs globales sont dans `styles.css` (`:root`).
- Le contenu de la page est dans `index.html`.
- Le style du back office est dans `admin.css`.
