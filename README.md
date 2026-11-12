# AtlasShop

Site e-commerce MERN haut de gamme pour l'artisanat marocain (tapis, poterie, cuir, cosmétiques naturels).
Projet final Lab Phase — GOMYCODE.

> README provisoire : la version complète (captures, variables d'environnement, comptes de démo, liens de déploiement) arrive en Phase 4.

## Structure

```
atlasshop/
  client/   React 18 + Vite + Tailwind + Redux Toolkit + GSAP / Lenis / Framer Motion
  server/   Express + Mongoose (Phase 2)
```

## Lancer le frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production
npm test         # tests unitaires
```

## Lancer le backend

```bash
cd server
cp .env.example .env   # puis remplir MONGO_URI, JWT_SECRET, Stripe, Cloudinary
npm install
npm run seed           # 1 admin, 1 client, 5 catégories, 20 produits (efface la base : SEED_FORCE=true sur Atlas)
npm run dev            # http://localhost:5000/api
npm test               # tests d'API sur une base MongoDB en mémoire
```

Sans compte MongoDB Atlas ni Stripe, `npm run dev:memoire` lance l'API sur une base en mémoire déjà remplie,
avec paiement simulé ; les comptes de démo et leurs mots de passe s'affichent dans le terminal.

## Déploiement

1. **MongoDB Atlas** : créer un cluster gratuit, un utilisateur de base, autoriser l'accès réseau `0.0.0.0/0`, copier l'URI.
2. **API sur Render** : New > Blueprint, choisir ce dépôt (`render.yaml` configure le service) puis saisir
   `MONGO_URI` et `CLIENT_URL` (URL Vercel). Stripe et Cloudinary sont optionnels : sans Stripe, le site propose le paiement à la livraison.
3. **Site sur Vercel** : importer le dépôt avec `client` comme Root Directory et définir
   `VITE_API_URL` (`https://<service>.onrender.com/api`), `VITE_SITE_URL` et `VITE_WHATSAPP_NUMBER`.
4. **Stripe** : Developers > Webhooks > ajouter `https://<service>.onrender.com/api/payments/webhook`
   pour l'événement `checkout.session.completed`, puis copier le secret `whsec_...` dans Render.
5. **Seed** : en local, avec l'URI Atlas dans `server/.env`, lancer `SEED_FORCE=true npm run seed`.

## Avancement

- [x] Phase 1 — frontend complet avec données mockées (accueil, catalogue, fiche produit, artisans, panier, checkout, compte, admin)
- [x] Phase 2 — backend Express + MongoDB et branchement du frontend sur l'API
- [ ] Phase 3 — déploiement (Vercel + Render) : configuration prête, mise en ligne à faire
- [ ] Phase 4 — README complet et support de pitch
