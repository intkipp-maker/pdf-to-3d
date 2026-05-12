# PDF to 3D Converter

Application web pour convertir tes plans PDF en fichiers 3D STL pour ton CNC DATRON NEO.

## Installation locale (optionnel)

```bash
npm install
npm run dev
```

L'app sera disponible à `http://localhost:3000`

## Déploiement sur Vercel

### Étape 1: Prépare le dossier
1. Télécharge tous les fichiers fournis dans un dossier sur ton ordinateur (exemple: `pdf-to-3d`)
2. Assure-toi d'avoir Git installé sur ton ordinateur

### Étape 2: Crée un repository GitHub
1. Va sur https://github.com/new
2. Crée un nouveau repository appelé `pdf-to-3d`
3. Clone le repo sur ton ordinateur:
   ```bash
   git clone https://github.com/tonnom/pdf-to-3d.git
   cd pdf-to-3d
   ```
4. Copie tous les fichiers que je t'ai donné dans ce dossier
5. Push les fichiers:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### Étape 3: Déploie sur Vercel
1. Va sur https://vercel.com et connecte-toi avec ton compte
2. Clique "Add New..." → "Project"
3. Sélectionne ton repository `pdf-to-3d`
4. Clique "Import"
5. Dans les "Environment Variables", ajoute:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Colle ta clé API Claude (https://console.anthropic.com)
6. Clique "Deploy"

**Voilà!** Dans 2-3 minutes, ton app sera live avec un lien du type:
`https://pdf-to-3d-XXXXX.vercel.app`

### Comment obtenir ta clé API Claude
1. Va sur https://console.anthropic.com
2. Connecte-toi (crée un compte si besoin)
3. Clique "API Keys" dans le menu
4. Clique "Create Key"
5. Copie la clé (elle ne s'affiche qu'une fois!)
6. Utilise-la dans Vercel (Étape 3, point 5)

## Utilisation

1. Ouvre ton lien Vercel
2. Upload ton PDF avec tes plans
3. Clique "Analyser le PDF"
4. Télécharge le fichier `.stl`
5. Importe-le dans Fusion 360 ou directement dans ton CNC

## Support

Si tu as des problèmes:
- Vérifie que ta clé API Claude est correcte
- Essaie avec un PDF simple et bien lisible
- Assure-toi que les dimensions sont clairement écrites sur le PDF
