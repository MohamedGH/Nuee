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

## Référencement (SEO)

- Métadonnées par page (`generateMetadata`) : titre, description, Open
  Graph, Twitter Card — génériques sur les pages statiques, dynamiques sur
  chaque fiche produit et le catalogue filtré.
- Données structurées JSON-LD : `Product` (prix, disponibilité, marque,
  note moyenne et avis individuels) et `BreadcrumbList` sur chaque fiche
  produit ; `ItemList` sur le catalogue (vue non filtrée) ; `Organization`
  et `WebSite` (avec action de recherche) sur l'accueil.
- Favicon et icône Apple générés dynamiquement (`app/icon.tsx`,
  `app/apple-icon.tsx`, via `next/og` — aucun fichier image à fournir) et
  image Open Graph par défaut (`app/opengraph-image.tsx`, 1200×630) pour
  le partage sur les réseaux ; chaque fiche produit la remplace par sa
  propre photo.
- `app/sitemap.ts` → `/sitemap.xml`, généré depuis la base (pages statiques,
  catégories, chaque produit).
- `app/robots.ts` → `/robots.txt`, référence le sitemap et exclut
  `/admin`, `/api`, `/panier`, `/favoris`, `/commandes`, `/commande/*`.
- Pages privées ou sans valeur pour un moteur de recherche marquées
  `noindex` : panier, favoris, suivi de commande, confirmation/annulation
  de paiement, admin, résultats de recherche/filtre sur le catalogue
  (quasi-doublons du catalogue de base — canonical vers la page propre).
- `NEXT_PUBLIC_APP_URL` sert de `metadataBase` : à renseigner avec le vrai
  domaine en production pour que les URLs canoniques et les images Open
  Graph résolvent correctement (sinon repli sur `http://localhost:3000`).

## Analytique

Google Analytics 4 + Microsoft Clarity (heatmaps, replays de session) —
tous deux optionnels et **désactivés par défaut**. Renseigne
`NEXT_PUBLIC_GA_MEASUREMENT_ID` et/ou `NEXT_PUBLIC_CLARITY_ID` dans
`.env.local` pour les activer ; sans ces variables, aucun script de suivi
n'est chargé et le bandeau de consentement ne s'affiche pas.

Même configurés, les scripts ne se chargent qu'après acceptation du
bandeau de cookies (rien n'est déposé avant, conformément au RGPD). Le
choix est mémorisé dans `localStorage`.

**API Topics (Privacy Sandbox)** — `NEXT_PUBLIC_ENABLE_TOPICS="true"`,
désactivée par défaut. Remplace le cookie tiers pour la publicité
ciblée : le navigateur classe l'internaute dans des centres d'intérêt
(taxonomie fixe Google) sans exposer son historique. À savoir avant de
l'activer :
- **Chrome uniquement** pour l'instant, et HTTPS obligatoire en production
  (`document.browsingTopics` n'existe pas ailleurs — `lib/topics.ts` le
  détecte et ne fait rien sinon).
- **Sans partenaire publicitaire côté NUÉE**, cet appel n'a aujourd'hui
  aucun effet commercial concret : il sert à (1) faire reconnaître ce site
  par le navigateur pour les calculs d'epoch à venir, (2) préparer une
  intégration future si un partenaire pub est ajouté. Ce n'est pas une
  fonctionnalité "prête à l'emploi" tant qu'aucun tel partenaire n'existe.
- **Ne renverra rien d'utile en local/développement** — le navigateur a
  besoin d'un historique de navigation réel pour classer des topics.
- Gérée par le même bandeau de consentement que Google Analytics/Clarity
  (elle traite aussi des données d'intérêt dérivées de la navigation).

**Event `purchase` envoyé depuis le serveur, pas le navigateur** — un
événement qui compte du chiffre d'affaires ne devrait pas dépendre d'un
script qui peut être bloqué ou d'un onglet fermé avant l'envoi. Le flux :
1. Au moment de payer, le panier récupère le `client_id` GA4 déjà attribué
   par gtag.js (`getGaClientId` dans `lib/analytics.ts`) et l'envoie à
   `/api/checkout`. Absent si la personne n'a pas consenti au suivi — dans
   ce cas, rien n'est envoyé côté serveur non plus.
2. Le `client_id` est stocké sur la commande (`gaClientId`).
3. Une fois le paiement confirmé, le **webhook Stripe** envoie l'event
   `purchase` directement à GA4 via l'API Measurement Protocol
   (`lib/ga4MeasurementProtocol.ts`, nécessite `GA4_API_SECRET` — généré
   dans GA4 → Admin → Flux de données → Measurement Protocol API secrets),
   sous ce même `client_id` pour rester rattaché à la bonne session.
4. Un drapeau (`gaPurchaseSent`) empêche un double envoi. La page de
   succès n'envoie plus rien elle-même — elle affiche un récapitulatif de
   commande à la place.

Événements e-commerce suivis (GA4) : `view_item`, `search`, `select_item`,
`view_item_list`, `add_to_cart`, `remove_from_cart`, `add_to_wishlist`,
`filter_products`, `begin_checkout`, `purchase` (avec valeur, réduction,
frais de port et articles) — de quoi reconstituer le tunnel de conversion
complet.

**Recommandations personnalisées** — indépendantes de GA (dont les données
ne sont pas relisibles depuis l'app) : `components/RecommendedForYou.tsx`
calcule, entièrement côté client à partir des favoris et des pièces
consultées récemment (déjà stockés en local), la catégorie la plus
représentée pour ce visiteur, puis affiche d'autres pièces de cette
catégorie sur l'accueil et le catalogue. Aucun signal ⇒ aucune section
affichée (pas de recommandation générique pour un premier visiteur).

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

**Piège connu** : un hash bcrypt contient des `$` (`$2a$12$...`), que le
chargeur d'environnement de Next.js (`@next/env`) interprète par défaut
comme une interpolation de variable — collé tel quel, le hash est
silencieusement corrompu et la connexion admin échoue avec un simple
"mot de passe incorrect", quel que soit le mot de passe saisi.
`npm run admin:hash` échappe désormais les `$` en `\$` dans sa sortie :
colle-la telle quelle, sans retirer les `\`. Si `/admin` refuse toujours
un mot de passe qui devrait être bon, le serveur affiche un avertissement
explicite dans sa console si le hash chargé ne ressemble pas à un vrai
hash bcrypt (longueur ou format inattendu).

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
- `components/analytics/` — modules autonomes et réutilisables,
  indépendants les uns des autres et du bandeau de consentement, importables
  via `@/components/analytics` :
  `GoogleAnalytics.tsx` (props `measurementId`, `nonce`, `onLoad`,
  `onError`) — suit aussi les changements de page côté client (`<Link>`,
  `router.push`), que le `gtag('config')` initial ne couvre pas à lui
  seul ;
  `MicrosoftClarity.tsx` (mêmes props) — `onError` détecte un vrai échec
  du script clarity.ms (bloqueur de pub), pas seulement l'exécution du
  petit snippet inline qui l'injecte ;
  `BrowsingTopics.tsx` (prop `onObserved`, découplé de tout consommateur
  particulier). `CookieConsent.tsx` ne fait que les composer selon le
  consentement — pour les réutiliser ailleurs (autre site, autre page),
  il suffit de les monter avec leurs props, sans dépendance au reste.
  Durcis pour la production : garde-fou contre la double initialisation
  (StrictMode, remontage), validation de l'ID en développement (avertit
  si le format ne correspond pas à un vrai measurementId/projectId),
  `<link rel="preconnect">` vers les domaines tiers pour accélérer le
  chargement, et respect automatique des signaux navigateur "Global
  Privacy Control"/"Do Not Track" (`lib/privacySignals.ts`) — refus
  silencieux, sans même afficher le bandeau, jamais contournable.
- `components/SocialLinks.tsx` + `lib/social.ts` — même pattern que les
  modules analytics : autonome, réutilisable, désactivé par défaut
  (chaque réseau n'apparaît que si son URL est renseignée dans
  `NEXT_PUBLIC_INSTAGRAM_URL` / `..._PINTEREST_URL` / `..._TIKTOK_URL` /
  `..._FACEBOOK_URL`). Badges typographiques plutôt que des logos de
  marque, pour rester dans l'esprit "étiquette" du site et éviter toute
  question de droits sur des logos tiers. Les URLs configurées
  alimentent aussi `sameAs` sur le schéma `Organization` de l'accueil
  (utile pour le knowledge graph Google).

## Accessibilité

- Lien d'évitement ("Aller au contenu") en tête de page, visible au focus
  clavier, cible `#main-content`.
- Contraste des couleurs vérifié WCAG AA : le jeton `muted` était à
  3,13:1 sur fond `bone` (insuffisant pour du texte normal, seuil 4,5:1)
  — corrigé à 5,02:1 en gardant la même teinte.
- Modales avec piège de focus complet (`lib/useFocusTrap.ts`, réutilisable
  — verrouille le défilement, place le focus à l'ouverture, piège
  Tab/Shift+Tab à l'intérieur, restitue le focus au déclencheur à la
  fermeture) : guide des tailles et menu mobile.
- Messages d'erreur des formulaires annoncés immédiatement aux lecteurs
  d'écran (`role="alert"`) plutôt que seulement visuels.
- `app/error.tsx` et `app/global-error.tsx` : page d'erreur à l'identité
  du site plutôt que la page Next.js générique par défaut si un
  composant plante.

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
