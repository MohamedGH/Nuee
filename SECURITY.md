# Sécurité — NUÉE

Résumé des protections en place et de ce qui reste à faire avant une mise
en production réelle avec de vrais paiements.

## En place

**Intégrité du paiement**
- Le prix envoyé à Stripe est toujours relu en base de données côté serveur
  (`app/api/checkout/route.ts`) — le client ne peut jamais influencer le
  montant facturé, même en modifiant les requêtes réseau.
- Le stock est vérifié avant la création de la session Stripe, puis
  décrémenté de façon conditionnelle (`stock >= quantité`) dans une
  transaction lors du webhook, ce qui évite un stock négatif en cas de
  commandes concurrentes sur la dernière unité.
- Le webhook Stripe **exige** une signature valide (`stripe-signature` +
  `STRIPE_WEBHOOK_SECRET`) — aucune commande ne peut être marquée "payée"
  sans preuve cryptographique venant de Stripe.
- Traitement idempotent du webhook : un même événement reçu plusieurs fois
  (Stripe retente en cas de timeout) ne décrémente le stock qu'une fois.

**Entrées utilisateur**
- Tous les corps de requête API sont validés avec Zod (`lib/validation.ts`)
  — types, formats, bornes de quantité — avant tout traitement.
- Les tailles sont restreintes à une énumération fixe (`XS`–`XL`), pas de
  chaîne libre.

**Abus / déni de service**
- Rate limiting par IP sur `/api/checkout` (10 tentatives / 10 min,
  `lib/rateLimit.ts`). En mémoire ici (suffisant pour une instance unique) —
  à remplacer par un store partagé (Upstash Redis, Vercel KV) en
  multi-instance.

**Réseau / navigateur**
- Content-Security-Policy stricte basée sur un nonce généré par requête
  (`middleware.ts`) — bloque l'exécution de scripts injectés (XSS).
- En-têtes `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`
  (`next.config.js`).
- Vérification de l'en-tête `Origin` sur `/api/checkout` en production —
  rejette les appels forgés depuis un autre domaine.

**Configuration**
- Variables d'environnement validées au démarrage avec Zod
  (`lib/env.ts`) — l'app refuse de démarrer en production si une clé
  Stripe ou le secret webhook sont absents ou mal formés.
- `.env*` exclu de Git (`.gitignore`).
- Les erreurs internes ne sont jamais renvoyées telles quelles au client
  (pas de stack trace, pas de message Prisma brut).

## À faire avant une vraie mise en production

- **HTTPS obligatoire** en amont (Vercel/Nginx) — HSTS ne protège que si le
  premier accès est déjà en HTTPS.
- **Base de données** : passer de SQLite à Postgres managé (connexions
  chiffrées, sauvegardes, accès réseau restreint).
- **Rate limiting distribué** si déploiement multi-instance.
- **Journalisation/alerting** des événements `survente détectée` et des
  webhooks rejetés (actuellement seulement `console.warn`/`console.error`).
- **Compte Stripe en mode live** avec clés restreintes (Restricted Keys)
  plutôt que la clé secrète complète, si seule la création de Checkout
  Sessions est nécessaire.
- **`/api/orders` (suivi de commande)** : révèle actuellement si une adresse
  email a passé commande (énumération possible), limité par le rate limit
  IP mais pas éliminé. Pour une vraie mise en production, remplacer par un
  lien magique envoyé par email plutôt qu'une recherche libre par adresse.
- **RGPD** : politique de confidentialité, base légale pour l'email
  collecté, durée de conservation des commandes.
- **Dépendances** : activer Dependabot/`npm audit` en CI ; la CSP et les
  en-têtes ci-dessus n'éliminent pas le besoin de mises à jour régulières.
