const { loadEnvConfig } = require("@next/env");
const bcrypt = require("bcryptjs");
const readline = require("readline");

loadEnvConfig(process.cwd());

const hash = process.env.ADMIN_PASSWORD_HASH;

console.log("=== ENVIRONMENT NEXT.JS ===");
console.log("Hash chargé :", !!hash);
console.log("Longueur   :", hash?.length);
console.log("Préfixe    :", hash?.slice(0, 7));
console.log("Secret     :", !!process.env.ADMIN_SESSION_SECRET);
console.log("===========================");

if (!hash) {
  console.error("❌ Next.js ne charge aucun ADMIN_PASSWORD_HASH");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Mot de passe : ", async (password) => {
  const ok = await bcrypt.compare(password, hash);

  console.log(
    ok
      ? "✅ NEXT.JS + bcrypt.compare() = TRUE"
      : "❌ NEXT.JS + bcrypt.compare() = FALSE"
  );

  rl.close();
});
