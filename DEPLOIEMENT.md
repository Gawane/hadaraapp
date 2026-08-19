# Guide de déploiement réel — Hadara Smart City

Ce guide déploie une vraie stack : **Supabase** (base de données), **API NestJS** (Docker sur Render/Railway ou VPS), **Next.js** (Vercel).

## 1. Base de données — Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans **Project Settings → Database**, copiez la `Connection string` (mode "Transaction pooler" recommandé pour la prod) → c'est votre `DATABASE_URL`.
3. En local, dans `hadara-api/` :
   ```bash
   cp .env.example .env
   # renseignez DATABASE_URL avec la chaîne Supabase
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
   Cela crée les 12 tables et un compte administrateur (`admin@hadara.sn` / `ChangeMe123!` — **à changer immédiatement**).
4. Activez le bucket **Storage** de Supabase ou configurez Cloudinary pour les photos (incidents, déchets, avatars) — voir variables `CLOUDINARY_*` dans `.env`.

## 2. API — NestJS (Docker)

**Option A — Render / Railway (le plus simple)**
1. Poussez ce dossier `hadara-api/` sur un dépôt GitHub.
2. Sur Render/Railway : "New Web Service" → connecter le repo → build via `Dockerfile` (déjà fourni).
3. Renseignez les variables d'environnement du `.env.example` dans le tableau de bord du service.
4. Ajoutez une commande de release/migration : `npx prisma migrate deploy`.
5. Notez l'URL publique de l'API (ex. `https://hadara-api.onrender.com`).

**Option B — VPS avec Docker Compose**
```bash
git clone <votre-repo> && cd hadara-api
cp .env.example .env   # renseignez les vraies valeurs
docker compose up -d --build
```
L'API écoute sur le port `3001` (préfixe `/api/v1`). Placez un reverse proxy (Nginx/Caddy) avec certificat TLS devant.

## 3. CI/CD

Le workflow `.github/workflows/ci-cd.yml` build, lint et applique les migrations à chaque push sur `main`. Ajoutez ces secrets dans **GitHub → Settings → Secrets and variables → Actions** :
- `DATABASE_URL`
- (optionnel) `RENDER_DEPLOY_HOOK_URL` ou équivalent pour déclencher le déploiement automatiquement.

## 4. Frontend — Next.js sur Vercel

1. Dans le projet Next.js (`apps/web`, à créer avec `npx create-next-app@latest` en réutilisant les composants de la démo HTML fournie comme référence visuelle), définissez :
   ```
   NEXT_PUBLIC_API_URL=https://hadara-api.onrender.com/api/v1
   ```
2. Connectez le repo à [vercel.com](https://vercel.com) → déploiement automatique à chaque push.
3. Renseignez la même variable `NEXT_PUBLIC_API_URL` dans **Vercel → Project Settings → Environment Variables**.
4. Le module Smart Guide consomme `GET /locations` et `GET /locations/nearby`, le Centre d'Urgence `POST /incidents`, l'authentification `POST /auth/login` et `POST /auth/register` — tous déjà implémentés dans l'API fournie.

## 5. Vérification post-déploiement

```bash
curl -X POST https://hadara-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hadara.sn","password":"ChangeMe123!"}'
```
Vous devez recevoir un `accessToken`. Changez immédiatement le mot de passe admin une fois connecté.

## 6. Prochaines étapes techniques

- Module `announcements` / `notifications` (diffusion SMS/WhatsApp) : brancher un provider (Twilio, WhatsApp Business API) dans un nouveau `notifications.service.ts`, suivant le même patron que les modules livrés.
- Module `chatbot` : créer `chatbot.module.ts` qui appelle l'API OpenAI avec le contexte RAG (voir `hadara-architecture-technique.md`), et journalise chaque échange dans `ChatbotLog`.
- Module `waste-reports` / `rewards` (Green Hadara) : même patron CRUD, avec upload de photo vers Cloudinary avant analyse IA.
- Ajouter des tests (Jest, déjà supporté par NestJS) avant toute mise en production réelle.
- Basculer `locations.nearby` d'un calcul en mémoire vers une requête PostGIS (`ST_DWithin`) une fois le volume de données important.
