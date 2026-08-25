"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, setQuantity, remove, total } = useCart();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountCents: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const subtotal = total();
  const discount = coupon?.discountCents ?? 0;
  const grandTotal = Math.max(0, subtotal - discount);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotalCents: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon({ code: couponInput.trim().toUpperCase(), discountCents: data.discountCents });
        setCouponMessage("Code appliqué.");
      } else {
        setCoupon(null);
        setCouponMessage(data.reason || "Code invalide.");
      }
    } catch {
      setCouponMessage("Impossible de vérifier ce code pour le moment.");
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email, couponCode: coupon?.code }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (e) {
      setError("Impossible de contacter le serveur de paiement.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
      <h1 className="font-display text-4xl italic mb-10 border-b border-line pb-6">
        Panier
      </h1>

      {items.length === 0 ? (
        <div>
          <p className="text-ink-soft mb-6">Le panier est vide.</p>
          <Link
            href="/produits"
            className="focus-ring font-mono text-xs tracking-tag uppercase border border-ink px-6 py-3 hover:bg-ink hover:text-bone transition-colors"
          >
            Voir la collection
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2 flex flex-col gap-6">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 border-b border-line pb-6"
              >
                <div className="relative w-20 h-24 shrink-0 bg-line">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg">{item.name}</p>
                  <p className="font-mono text-xs text-ink-soft mt-1">
                    Taille {item.size}
                  </p>
                  <p className="font-mono text-sm mt-2">{formatPrice(item.priceCents)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <select
                      value={item.quantity}
                      onChange={(e) =>
                        setQuantity(item.productId, item.size, Number(e.target.value))
                      }
                      className="focus-ring font-mono text-xs border border-line px-2 py-1 bg-bone"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          Qté {n}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => remove(item.productId, item.size)}
                      className="focus-ring font-mono text-xs text-ink-soft hover:text-brick underline underline-offset-4"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
                <p className="font-mono text-sm shrink-0">
                  {formatPrice(item.priceCents * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="border border-line p-6 h-fit">
            <label className="block font-mono text-xs tracking-tag uppercase text-ink-soft mb-2">
              Code promo
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponMessage(null);
                }}
                placeholder="BIENVENUE10"
                className="focus-ring flex-1 border border-line px-3 py-2 bg-bone font-mono text-sm uppercase"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                className="focus-ring font-mono text-xs tracking-tag uppercase border border-ink px-4 hover:bg-ink hover:text-bone transition-colors disabled:opacity-40"
              >
                {couponLoading ? "…" : "OK"}
              </button>
            </div>
            {couponMessage && (
              <p
                className={`text-xs font-mono mb-4 ${
                  coupon ? "text-ink-soft" : "text-brick"
                }`}
              >
                {couponMessage}
              </p>
            )}

            <div className="flex justify-between font-mono text-sm mb-1 pt-4 border-t border-line">
              <span className="text-ink-soft">Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-mono text-sm mb-1 text-brick">
                <span>Réduction ({coupon?.code})</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-mono text-sm mb-6 pt-1">
              <span className="font-medium">Total</span>
              <span className="font-medium">{formatPrice(grandTotal)}</span>
            </div>

            <label className="block font-mono text-xs tracking-tag uppercase text-ink-soft mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              className="focus-ring w-full border border-line px-3 py-2 mb-6 bg-bone font-body"
            />

            {error && <p className="text-brick text-xs mb-4 font-mono">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={loading || !email}
              className="focus-ring w-full font-mono text-xs tracking-tag uppercase px-6 py-4 bg-ink text-bone hover:bg-brick-dark transition-colors disabled:bg-muted disabled:cursor-not-allowed"
            >
              {loading ? "Redirection…" : "Payer — carte ou PayPal"}
            </button>
            <p className="text-[11px] text-muted mt-3 leading-relaxed">
              Démo — carte de test 4242 4242 4242 4242 (toute date future,
              tout CVC), ou choisissez PayPal sur l'écran Stripe suivant
              (identifiants sandbox PayPal). Codes promo de démo :
              BIENVENUE10, NUEE20, PORT5.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
