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
console.log("\nAjoute ceci à ton .env.local :\n");
console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
console.log("\n(Le mot de passe en clair n'est jamais stocké — seul ce hash l'est.)\n");
