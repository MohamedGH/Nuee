const fs = require("fs");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const env = fs.readFileSync(".env.local", "utf8");

const line = env
  .split(/\r?\n/)
  .find(x => x.startsWith("ADMIN_PASSWORD_HASH="));

if (!line) {
  console.error("? ADMIN_PASSWORD_HASH introuvable");
  process.exit(1);
}

const hash = line
  .slice("ADMIN_PASSWORD_HASH=".length)
  .trim()
  .replace(/^["']|["']$/g, "");

console.log("? Hash trouvé");
console.log("   Longueur :", hash.length);
console.log("   Préfixe  :", hash.slice(0, 7));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Mot de passe à tester : ", async (password) => {
  const result = await bcrypt.compare(password, hash);

  if (result) {
    console.log("? bcrypt.compare() = TRUE");
  } else {
    console.log("? bcrypt.compare() = FALSE");
  }

  rl.close();
});
