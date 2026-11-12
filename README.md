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

## Avancement

- [x] Phase 1 — frontend complet avec données mockées (accueil, catalogue, fiche produit, artisans, panier, checkout, compte, admin)
- [ ] Phase 2 — backend et branchement API
- [ ] Phase 3 — déploiement (Vercel + Render)
- [ ] Phase 4 — README complet et support de pitch
