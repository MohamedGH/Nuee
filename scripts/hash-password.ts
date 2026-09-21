import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run admin:hash -- \"votre-mot-de-passe\"");
  process.exit(1);
}

if (password.length < 12) {
  console.error("Le mot de passe admin doit faire au moins 12 caractères.");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
// @next/env (le chargeur de .env de Next.js) interprète $NOM comme une
// interpolation de variable — sans échappement, un hash bcrypt du type
// "$2a$12$..." est silencieusement corrompu au chargement (tronqué,
// morceaux remplacés par du vide). "\$" est la séquence d'échappement
// reconnue par @next/env pour produire un "$" littéral une fois chargé.
const escaped = hash.replace(/\$/g, "\\$");
console.log("\nAjoute ceci à ton .env.local :\n");
console.log(`ADMIN_PASSWORD_HASH="${escaped}"`);
console.log(
  "\n(Le mot de passe en clair n'est jamais stocké — seul ce hash l'est. Les $ sont " +
    "échappés en \\$ : c'est nécessaire, ne les retire pas en collant la valeur.)\n"
);
