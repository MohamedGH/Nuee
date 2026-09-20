const fs = require("fs");
const { loadEnvConfig } = require("@next/env");

console.log("=== VALEUR BRUTE DES FICHIERS ===");

for (const file of [".env.local", ".env", ".env.development.local", ".env.development"]) {
  if (!fs.existsSync(file)) continue;

  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

  for (const line of lines) {
    if (line.startsWith("ADMIN_PASSWORD_HASH=")) {
      const value = line.substring("ADMIN_PASSWORD_HASH=".length);

      console.log(`\n${file}`);
      console.log("Longueur brute :", value.length);
      console.log("Début brut     :", JSON.stringify(value.slice(0, 20)));
      console.log("Nombre de $    :", (value.match(/\$/g) || []).length);
    }
  }
}

console.log("\n=== VALEUR APRÈS PARSING NEXT ===");

loadEnvConfig(process.cwd());

const v = process.env.ADMIN_PASSWORD_HASH;

console.log("Longueur chargée :", v?.length);
console.log("Début chargé     :", JSON.stringify(v?.slice(0, 20)));
console.log("Nombre de $      :", (v?.match(/\$/g) || []).length);
console.log("Commence $2      :", v?.startsWith("$2"));
