require("dotenv").config({ path: ".env.local" });

const h = process.env.ADMIN_PASSWORD_HASH;

console.log("ADMIN_PASSWORD_HASH chargé :", !!h);
console.log("Longueur :", h?.length);
console.log("Préfixe :", h?.slice(0, 7));
console.log("ADMIN_SESSION_SECRET chargé :", !!process.env.ADMIN_SESSION_SECRET);
console.log("Longueur secret :", process.env.ADMIN_SESSION_SECRET?.length);
