# Hadara Web — Frontend Next.js 15

Interface connectée à l'API `hadara-api` (aucune donnée simulée : tout provient des vrais endpoints).

## Démarrage local

```bash
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL doit pointer vers votre API (local ou déployée)
npm install
npm run dev
```

Ouvrez `http://localhost:3000`.

## Pages livrées

| Route | Contenu | Endpoint(s) API utilisés |
|---|---|---|
| `/` | Landing | — |
| `/login` | Connexion | `POST /auth/login` |
| `/dashboard` | Événements + incidents | `GET /events`, `GET /incidents` |
| `/guide` | Carte Leaflet réelle | `GET /locations` |
| `/urgence` | Bouton SOS avec géolocalisation navigateur | `POST /incidents` |
| `/chatbot` | Assistant IA multilingue | `POST /chatbot/message` |
| `/green` | Classement Green Hadara | `GET /green/leaderboard` |

## Déploiement sur Vercel

1. Poussez ce dossier sur GitHub.
2. Importez le projet sur [vercel.com](https://vercel.com).
3. Ajoutez la variable d'environnement `NEXT_PUBLIC_API_URL` (Production + Preview) pointant vers votre API déployée (voir `DEPLOIEMENT.md` du dossier `hadara-api`).
4. Déployez — Vercel rebuild automatiquement à chaque push.

## Ce qui reste à faire pour la production

- Rafraîchissement automatique du token JWT (refresh token déjà émis par l'API, non encore consommé côté client).
- Écrans Organisateur / Équipe terrain dédiés (actuellement le dashboard est générique).
- Formulaire d'inscription visiteur (`POST /auth/register`) — pas encore de page dédiée.
- Upload réel de photos (Cloudinary) pour Green Hadara et les incidents, actuellement le champ `photoUrl` attend une URL déjà hébergée.
