const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const v = process.env.ADMIN_PASSWORD_HASH;

console.log("================================");
console.log("ADMIN_PASSWORD_HASH chargé par Next");
console.log("================================");
console.log("Existe       :", !!v);
console.log("Longueur     :", v?.length);
console.log("Premiers 10  :", JSON.stringify(v?.slice(0, 10)));
console.log("Derniers 10  :", JSON.stringify(v?.slice(-10)));
console.log("Commence $2  :", v?.startsWith("$2"));
console.log("================================");
