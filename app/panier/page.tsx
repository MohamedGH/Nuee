"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/format";
import { shippingCostCents, GIFT_WRAP_CENTS, type ShippingMethod } from "@/lib/shipping";
import FreeShippingBar from "@/components/FreeShippingBar";
import QuantityStepper from "@/components/QuantityStepper";
import { useToast } from "@/store/toast";
import { IMAGE_BLUR_DATA_URL } from "@/lib/imagePlaceholder";
import { trackBeginCheckout, trackRemoveFromCart, getGaClientId } from "@/lib/analytics";

export default function CartPage() {
  const { items, setQuantity, remove, add, total, count } = useCart();
  const showToast = useToast((s) => s.show);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountCents: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const subtotal = total();
  const discount = coupon?.discountCents ?? 0;
  const shipping = shippingCostCents(subtotal, shippingMethod);
  const giftWrapCents = giftWrap ? GIFT_WRAP_CENTS : 0;
  const grandTotal = Math.max(0, subtotal - discount) + shipping + giftWrapCents;

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
      const gaClientId = await getGaClientId();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          email,
          couponCode: coupon?.code,
          shippingMethod,
          giftWrap,
          gaClientId,
        }),
      });
      const data = await res.json();
      if (data.url) {
        trackBeginCheckout(
          items.map((i) => ({
            item_id: i.productId,
            item_name: i.name,
            price: i.priceCents / 100,
            quantity: i.quantity,
          })),
          grandTotal / 100
        );
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

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16 animate-pulse">
        <div className="h-10 bg-line w-40 mb-6 border-b border-line pb-6" />
        <div className="flex flex-col gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-line pb-6">
              <div className="w-20 h-24 shrink-0 bg-line" />
              <div className="flex-1">
                <div className="h-5 bg-line w-2/3 mb-2" />
                <div className="h-3 bg-line w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
      <h1 className="font-display text-4xl italic mb-6 border-b border-line pb-6 flex items-baseline gap-3">
        Panier
        {mounted && items.length > 0 && (
          <span className="font-mono text-sm text-ink-soft">
            ({count()} article{count() > 1 ? "s" : ""})
          </span>
        )}
      </h1>

      {items.length === 0 ? (
        <div>
          <p className="text-ink-soft mb-6">
            Le panier est vide — les huit pièces sont sur la collection.
          </p>
          <Link
            href="/produits"
            className="focus-ring font-mono text-xs tracking-tag uppercase border border-ink px-6 py-3 hover:bg-ink hover:text-bone transition-colors"
          >
            Voir la collection
          </Link>
        </div>
      ) : (
        <>
          <FreeShippingBar subtotalCents={subtotal} />

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="md:col-span-2 flex flex-col gap-6">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-4 border-b border-line pb-6"
                >
                  <div className="relative w-20 h-24 shrink-0 bg-line">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      placeholder="blur"
                      blurDataURL={IMAGE_BLUR_DATA_URL}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg">{item.name}</p>
                    <p className="font-mono text-xs text-ink-soft mt-1">
                      Taille {item.size}
                    </p>
                    <p className="font-mono text-sm mt-2">{formatPrice(item.priceCents)}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <QuantityStepper
                        quantity={item.quantity}
                        max={10}
                        onChange={(next) => setQuantity(item.productId, item.size, next)}
                      />
                      <button
                        onClick={() => {
                          trackRemoveFromCart({
                            item_id: item.productId,
                            item_name: item.name,
                            price: item.priceCents / 100,
                            quantity: item.quantity,
                          });
                          remove(item.productId, item.size);
                          showToast(`${item.name} retiré du panier`, {
                            label: "Annuler",
                            onClick: () => add(item),
                          });
                        }}
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

            <div className="flex flex-col gap-6 h-fit">
              <div className="border border-line p-6">
                <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-3">
                  Livraison
                </p>
                <div className="flex flex-col gap-2 mb-6">
                  {(["standard", "express"] as ShippingMethod[]).map((m) => {
                    const cost = shippingCostCents(subtotal, m);
                    return (
                      <label
                        key={m}
                        className={`focus-ring flex items-center justify-between border px-3 py-2 cursor-pointer text-sm font-mono ${
                          shippingMethod === m ? "border-ink" : "border-line"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="shipping"
                            checked={shippingMethod === m}
                            onChange={() => setShippingMethod(m)}
                            className="accent-ink"
                          />
                          {m === "standard" ? "Standard (3–5 jours)" : "Express (24–48h)"}
                        </span>
                        <span>{cost === 0 ? "Offerte" : formatPrice(cost)}</span>
                      </label>
                    );
                  })}
                </div>

                <label className="flex items-center gap-2 mb-6 text-sm font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="accent-ink"
                  />
                  Emballage cadeau (+{formatPrice(GIFT_WRAP_CENTS)})
                </label>

                <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-2">
                  Code promo
                </p>
                {coupon ? (
                  <div className="flex items-center justify-between border border-ink px-3 py-2">
                    <span className="font-mono text-sm">{coupon.code}</span>
                    <button
                      onClick={() => {
                        setCoupon(null);
                        setCouponInput("");
                        setCouponMessage(null);
                      }}
                      className="focus-ring font-mono text-xs text-ink-soft hover:text-brick underline underline-offset-4"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
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
                )}
                {couponMessage && !coupon && (
                  <p role="alert" className="text-xs font-mono mt-2 text-brick">{couponMessage}</p>
                )}
              </div>

              <div className="border border-line p-6">
                <p className="font-mono text-xs tracking-tag uppercase text-ink-soft mb-4">
                  Récapitulatif
                </p>
                <div className="flex justify-between font-mono text-sm mb-1">
                  <span className="text-ink-soft">Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-mono text-sm mb-1 text-brick">
                    <span>Réduction ({coupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-mono text-sm mb-1">
                  <span className="text-ink-soft">Livraison</span>
                  <span>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</span>
                </div>
                {giftWrap && (
                  <div className="flex justify-between font-mono text-sm mb-1">
                    <span className="text-ink-soft">Emballage cadeau</span>
                    <span>{formatPrice(giftWrapCents)}</span>
                  </div>
                )}
                <div className="flex justify-between font-mono text-sm mb-6 pt-3 border-t border-line">
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

                {error && <p role="alert" className="text-brick text-xs mb-4 font-mono">{error}</p>}

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
                  BIENVENUE10, NUEE20, PORT5. L'adresse de livraison est
                  demandée par Stripe à l'étape suivante.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
