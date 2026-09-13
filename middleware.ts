import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Garde rapide, basée sur la simple présence du cookie — pas une
  // vérification cryptographique (impossible ici en runtime Edge sans
  // Web Crypto). La vérification réelle du token signé a lieu côté
  // Node.js dans requireAdmin()/isAdminRequest() sur chaque page et route
  // /api/admin/*, qui restent la seule source de vérité pour l'accès.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasCookie = request.cookies.has("nuee_admin_session");
    if (!hasCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV !== "production";

  const csp = [
    "default-src 'self'",
    // 'unsafe-eval' est nécessaire au rechargement à chaud (React Refresh)
    // de Next.js en développement — jamais activé en production.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'", // Tailwind génère du CSS via classes, pas de style inline dynamique sensible
    "img-src 'self' https: data:",
    "font-src 'self' data:",
    `connect-src 'self' https://api.stripe.com https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms${isDev ? " ws:" : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    // Applique le CSP à toutes les routes sauf les assets statiques internes.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
