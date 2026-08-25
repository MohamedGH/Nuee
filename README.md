# NUÉE — e-shop mode (démo portfolio)

Plateforme e-shop Next.js full-stack : catalogue, panier, paiement Stripe
(mode test), base de données SQLite via Prisma.

## Installation

```bash
npm install
cp .env.example .env.local
# renseigne STRIPE_SECRET_KEY (clé de test, commence par sk_test_...)
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Ouvre http://localhost:3000

## Paiement de test

Carte : `4242 4242 4242 4242` — date future quelconque — CVC quelconque.

PayPal : le checkout propose aussi PayPal. Il faut l'activer une fois dans
le dashboard Stripe → Paramètres → Moyens de paiement → PayPal (disponible
en mode test sans compte PayPal réel).

Pour recevoir la confirmation de commande (webhook) en local :

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

(nécessite le CLI Stripe : `brew install stripe/stripe-cli/stripe` ou
équivalent). Copie le `whsec_...` affiché dans `.env.local`.

## Fonctionnalités

- Essayage 3D (`/essayage`) : mannequin stylisé (Three.js / React Three
  Fiber), sélection de pièces par emplacement (haut / bas / robe /
  accessoire), rotation à la souris, ajout de la tenue complète au panier
- Catalogue avec recherche, tri (nouveautés / prix) et filtre par catégorie
- Favoris (persistés en local, page dédiée `/favoris`)
- Produits similaires et "consultés récemment" sur chaque fiche produit
- Sélecteur de quantité et badge "rupture de stock"
- Avis clients avec notation par étoiles (`/api/reviews`, modérables via
  `verified` en base)
- Guide des tailles (modal)
- Alerte réassort par email sur une taille en rupture (`/api/stock-alert`
  — enregistre la demande ; l'envoi d'email au réassort est à brancher)
- Fil d'Ariane sur les fiches produit
- Codes promo (`BIENVENUE10`, `NUEE20`, `PORT5` en démo) — remise recalculée
  et vérifiée côté serveur avant d'être appliquée à la session Stripe
- Suivi de commande par email (`/commandes`)
- Paiement Stripe (carte + PayPal), webhook signé, stock décrémenté de façon
  idempotente

## Structure

- `app/` — pages (App Router) : accueil, catalogue, fiche produit, panier,
  confirmation
- `app/api/checkout` — création de session Stripe Checkout
- `app/api/webhook` — confirmation de commande + décrément du stock
- `prisma/schema.prisma` — modèles Product / Variant / Order / OrderItem
- `prisma/seed.ts` — 8 pièces de démo (huit "looks")
- `store/cart.ts` — panier client (Zustand, persistant en localStorage)

## Passer en production

- Remplacer SQLite par Postgres (Neon, Supabase) : changer `provider` dans
  `schema.prisma` et `DATABASE_URL`.
- Ajouter les vraies clés Stripe live + webhook configuré sur le domaine réel.
- Remplacer les images `picsum.photos` par de vraies photos produit.
- Ajouter une authentification si besoin d'un espace client / suivi de
  commandes.
- Le mannequin 3D (`/essayage`) est un essayage stylisé, pas un rendu
  photoréaliste : les vêtements sont représentés par des formes géométriques
  simples colorées à partir du premier coloris du produit. Pour un vrai
  essayage visuel, il faudrait des modèles 3D de vêtements (GLTF) déformés
  sur un squelette (rigging), ce qui dépasse le cadre de cette démo.
