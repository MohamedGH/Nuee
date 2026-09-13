"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

type Order = {
  id: string;
  status: string;
  totalCents: number;
  discountCents: number;
  couponCode: string | null;
  shippingMethod: string;
  shippingCents: number;
  giftWrap: boolean;
  shippingAddress: {
    name: string | null;
    line1: string;
    line2: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
  createdAt: string;
  items: {
    name: string;
    image: string;
    slug: string;
    size: string;
    quantity: number;
    priceCents: number;
  }[];
};

export default function OrdersLookupPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setOrders(null);
      } else {
        setOrders(data.orders);
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
      <h1 className="font-display text-4xl italic mb-4 border-b border-line pb-6">
        Suivre ma commande
      </h1>
      <p className="text-ink-soft text-sm mb-8">
        Entrez l'adresse email utilisée lors de la commande pour retrouver son
        statut.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-10">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.fr"
          className="focus-ring flex-1 border border-line px-3 py-2 bg-bone font-body text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="focus-ring font-mono text-xs tracking-tag uppercase border border-ink px-6 hover:bg-ink hover:text-bone transition-colors disabled:opacity-40"
        >
          {loading ? "…" : "Chercher"}
        </button>
      </form>

      {error && <p className="text-brick text-sm font-mono mb-8">{error}</p>}

      {searched && !error && orders?.length === 0 && (
        <p className="text-ink-soft text-sm">
          Aucune commande payée trouvée pour cette adresse.
        </p>
      )}

      <div className="flex flex-col gap-8">
        {orders?.map((order) => (
          <div key={order.id} className="border border-line p-6">
            <div className="flex justify-between items-baseline mb-4">
              <p className="font-mono text-xs tracking-tag uppercase text-ink-soft">
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <span className="font-mono text-[10px] tracking-tag uppercase bg-ink text-bone px-2 py-1">
                {order.status}
              </span>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              {order.items.map((item, i) => (
                <Link
                  href={`/produits/${item.slug}`}
                  key={i}
                  className="focus-ring flex gap-3 items-center"
                >
                  <div className="relative w-12 h-14 shrink-0 bg-line">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p>{item.name}</p>
                    <p className="text-ink-soft font-mono text-xs">
                      Taille {item.size} · Qté {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono text-xs shrink-0">
                    {formatPrice(item.priceCents * item.quantity)}
                  </p>
                </Link>
              ))}
            </div>

            {order.discountCents > 0 && (
              <p className="font-mono text-xs text-brick mb-1">
                Réduction {order.couponCode ? `(${order.couponCode})` : ""}: -
                {formatPrice(order.discountCents)}
              </p>
            )}
            <p className="font-mono text-xs text-ink-soft mb-1">
              Livraison {order.shippingMethod === "express" ? "express" : "standard"} :{" "}
              {order.shippingCents === 0 ? "offerte" : formatPrice(order.shippingCents)}
            </p>
            {order.giftWrap && (
              <p className="font-mono text-xs text-ink-soft mb-1">Emballage cadeau inclus</p>
            )}
            {order.shippingAddress && (
              <p className="font-mono text-xs text-ink-soft mb-3 pt-3 border-t border-line leading-relaxed">
                Livré à : {order.shippingAddress.name && `${order.shippingAddress.name}, `}
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""},{" "}
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
              </p>
            )}
            <div className="flex justify-between font-mono text-sm pt-3 border-t border-line">
              <span className="text-ink-soft">Total payé</span>
              <span>{formatPrice(order.totalCents)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
