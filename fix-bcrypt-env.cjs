const fs = require("fs");

for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, "utf8");

  content = content.replace(
    /^ADMIN_PASSWORD_HASH=(.*)$/gm,
    (_, value) => {
      const unescaped = value.replace(/\\\$/g, "$");
      const escaped = unescaped.replace(/\$/g, "\\$");
      return `ADMIN_PASSWORD_HASH=${escaped}`;
    }
  );

  fs.writeFileSync(file, content, "utf8");
  console.log(`Corrigé : ${file}`);
}
