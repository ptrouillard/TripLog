# TripLog

Site vitrine de blog de voyages en HTML/CSS/JS vanilla.

## Fonctionnalites

- Page hero avec direction artistique voyage
- Timeline de recits avec photos
- Integration video par etape
- Back office dedie pour creer, modifier et supprimer les voyages
- Editeur WYSIWYG (rich text) pour le contenu des recits
- Responsive mobile et desktop
- Sauvegarde des contenus dans le navigateur (localStorage)

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

## Utiliser le back office

1. Ouvrez `http://localhost:5500/admin.html`.
2. Selectionnez un voyage dans la colonne de gauche, ou cliquez sur `Nouveau`.
3. Modifiez les champs et le contenu riche dans l editeur.
4. Cliquez sur `Enregistrer`.
5. Revenez sur `index.html` pour voir le rendu public.

## Personnalisation rapide

- Les recits sont centralises dans `store.js`.
- Les couleurs globales sont dans `styles.css` (`:root`).
- Le contenu de la page est dans `index.html`.
- Le style du back office est dans `admin.css`.
