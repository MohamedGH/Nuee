"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ fontFamily: "serif", background: "#F1EDE4", color: "#1C1A16" }}>
        <div style={{ maxWidth: 480, margin: "6rem auto", textAlign: "center", padding: "0 1.5rem" }}>
          <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#7A2E1D", marginBottom: 24 }}>
            Erreur critique
          </p>
          <h1 style={{ fontSize: 32, fontStyle: "italic", marginBottom: 24 }}>
            Le site n'a pas pu se charger.
          </h1>
          <button
            onClick={reset}
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              padding: "12px 24px",
              background: "#1C1A16",
              color: "#F1EDE4",
              border: "none",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
