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

## Analytique

Google Analytics 4 + Microsoft Clarity (heatmaps, replays de session) —
tous deux optionnels et **désactivés par défaut**. Renseigne
`NEXT_PUBLIC_GA_MEASUREMENT_ID` et/ou `NEXT_PUBLIC_CLARITY_ID` dans
`.env.local` pour les activer ; sans ces variables, aucun script de suivi
n'est chargé et le bandeau de consentement ne s'affiche pas.

Même configurés, les scripts ne se chargent qu'après acceptation du
bandeau de cookies (rien n'est déposé avant, conformément au RGPD). Le
choix est mémorisé dans `localStorage`.

Événements e-commerce suivis (GA4) : `view_item`, `search`, `add_to_cart`,
`begin_checkout`, `purchase` (avec valeur, réduction, frais de port et
articles) — de quoi reconstituer le tunnel de conversion complet.

## Espace administrateur

`/admin` — tableau de bord (avec commandes récentes), commandes (recherche,
filtre par statut, détail avec adresse de livraison, changement de statut),
produits (nom/description/prix), stock, alertes réassort, modération des
avis, coupons, abonnés newsletter.

```bash
npm run admin:hash -- "un-mot-de-passe-d-au-moins-12-caracteres"
# copie le hash affiché dans ADMIN_PASSWORD_HASH (.env.local)
# ajoute aussi ADMIN_SESSION_SECRET (32+ caractères aléatoires,
# par ex. `openssl rand -hex 32`)
```

Sans ces deux variables, `/admin` reste inaccessible (503 à la connexion).
Session de 12h, cookie signé httpOnly/secure/SameSite=Strict, connexion
limitée à 8 tentatives / 15 min par IP. Détail dans `SECURITY.md`.

## Fonctionnalités

- Newsletter (inscription en pied de page, liste consultable en admin)
- Galerie photo sur chaque fiche produit (miniatures + vue principale)
- Livraison : choix standard/express avec seuil de livraison offerte
  (barre de progression dans le panier), adresse collectée par Stripe à
  l'étape de paiement, coût recalculé côté serveur
- Emballage cadeau en option
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
- Le mannequin 3D (`/essayage`) est un buste de couturier stylisé et un
  tissu procédural (texture tissée + drapé/plis générés sur la géométrie),
  pas un scan photoréaliste : le bac à sable de génération n'a pas accès
  aux dépôts de modèles 3D externes (Sketchfab, Mixamo…), seulement à
  npm/GitHub. Pour un vrai essayage visuel avec de vraies pièces, il
  faudrait des modèles GLTF de vêtements déformés sur un squelette
  (rigging) — à envisager si tu veux fournir/licencier ces assets.
