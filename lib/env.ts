import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL manquant"),
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith("sk_", "STRIPE_SECRET_KEY doit commencer par sk_"),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith("whsec_", "STRIPE_WEBHOOK_SECRET doit commencer par whsec_")
    .optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // En production, une config invalide ne doit jamais démarrer silencieusement.
  const details = parsed.error.flatten().fieldErrors;
  const message = `Variables d'environnement invalides: ${JSON.stringify(details)}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  } else {
    console.warn(message);
  }
}

export const env = (parsed.success ? parsed.data : (process.env as any)) as z.infer<
  typeof envSchema
>;

if (env.NODE_ENV === "production" && !env.STRIPE_WEBHOOK_SECRET) {
  throw new Error(
    "STRIPE_WEBHOOK_SECRET est obligatoire en production — sans lui, les webhooks ne peuvent pas être vérifiés et les commandes ne peuvent pas être authentifiées."
  );
}
