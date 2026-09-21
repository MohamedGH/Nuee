import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";

export const ADMIN_COOKIE = "nuee_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 heures

function sign(payload: string): string {
  return createHmac("sha256", env.ADMIN_SESSION_SECRET!).update(payload).digest("hex");
}

export function isAdminConfigured(): boolean {
  return Boolean(env.ADMIN_PASSWORD_HASH && env.ADMIN_SESSION_SECRET);
}

/**
 * Un hash bcrypt fait toujours 60 caractères et commence par "$2". S'il
 * ne correspond pas à ce format alors que la variable est définie, c'est
 * presque toujours le même bug : @next/env a interprété les "$" du hash
 * (ex. "$2a$12$...") comme une interpolation de variable et l'a corrompu
 * au chargement — voir `npm run admin:hash`, qui échappe désormais les
 * "$" en "\$" pour l'éviter. Sans ce contrôle, l'admin échoue avec un
 * simple "mot de passe incorrect" quel que soit le mot de passe saisi,
 * ce qui est très difficile à diagnostiquer de l'extérieur.
 */
function warnIfHashLooksCorrupted() {
  const hash = env.ADMIN_PASSWORD_HASH;
  if (hash && (!hash.startsWith("$2") || hash.length !== 60)) {
    console.error(
      "ADMIN_PASSWORD_HASH semble corrompu (longueur ou format inattendu). " +
        "C'est généralement dû à des \"$\" non échappés dans .env.local — " +
        "régénère la valeur avec `npm run admin:hash -- \"ton-mot-de-passe\"` " +
        "et colle le résultat tel quel (les \\$ font partie de la valeur, ne les retire pas)."
    );
  }
}
warnIfHashLooksCorrupted();

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!env.ADMIN_PASSWORD_HASH) return false;
  return bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
}

export function createSessionToken(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })).toString(
    "base64url"
  );
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !env.ADMIN_SESSION_SECRET) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

/** À appeler en tête de chaque page /admin (Server Component) — redirige vers /admin/login si la session est absente ou invalide. */
export async function requireAdmin() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    redirect("/admin/login");
  }
}

/** À appeler en tête de chaque route /api/admin/* — retourne true si la session est valide. */
export function isAdminRequest(req: Request): boolean {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${ADMIN_COOKIE}=([^;]+)`));
  return verifySessionToken(match?.[1]);
}

/** Défense CSRF : la session admin est un cookie, donc on vérifie aussi que la requête vient bien du même site. */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true; // pas d'en-tête Origin (ex: outils CLI) — laissé passer, l'auth cookie reste requise
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
