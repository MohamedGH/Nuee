declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number; // en euros, pas en centimes
  quantity?: number;
};

function track(eventName: string, params: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

/**
 * Récupère le client_id GA4 du navigateur (celui déjà attribué par
 * gtag.js), pour l'envoyer avec la commande et permettre au webhook
 * d'envoyer l'event purchase côté serveur sous la même identité de
 * session plutôt que comme un hit orphelin. Résout `null` si GA n'est
 * pas chargé (refus de consentement, bloqueur de pub) — dans ce cas, ne
 * PAS envoyer purchase côté serveur non plus : l'absence de client_id
 * signale que la personne n'a pas consenti au suivi.
 */
export function getGaClientId(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID) {
      resolve(null);
      return;
    }
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, 1000);
    window.gtag("get", GA_MEASUREMENT_ID, "client_id", (clientId: string | undefined) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(clientId ?? null);
    });
  });
}

export function trackViewItem(item: AnalyticsItem) {
  track("view_item", {
    currency: "EUR",
    value: item.price,
    items: [item],
  });
}

export function trackSearch(searchTerm: string) {
  track("search", { search_term: searchTerm });
}

export function trackAddToCart(item: AnalyticsItem) {
  track("add_to_cart", {
    currency: "EUR",
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackRemoveFromCart(item: AnalyticsItem) {
  track("remove_from_cart", {
    currency: "EUR",
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackSelectItem(item: AnalyticsItem, listName: string) {
  track("select_item", {
    item_list_name: listName,
    items: [item],
  });
}

export function trackViewItemList(items: AnalyticsItem[], listName: string) {
  track("view_item_list", {
    item_list_name: listName,
    items,
  });
}

export function trackFilter(params: { category?: string; sort?: string; minPrice?: number; maxPrice?: number }) {
  track("filter_products", params);
}

export function trackBrowsingTopics(topicIds: number[]) {
  if (topicIds.length === 0) return;
  track("browsing_topics_observed", { topic_ids: topicIds.join(",") });
}

export function trackAddToWishlist(item: AnalyticsItem) {
  track("add_to_wishlist", {
    currency: "EUR",
    value: item.price,
    items: [item],
  });
}

export function trackBeginCheckout(items: AnalyticsItem[], value: number) {
  track("begin_checkout", { currency: "EUR", value, items });
}

/**
 * Suivi purchase côté client. NUÉE ne l'appelle plus depuis
 * app/commande/succes — cet event part désormais du webhook Stripe via
 * lib/ga4MeasurementProtocol.ts (fiable même si ce script est bloqué ou
 * l'onglet fermé trop tôt). Conservée pour les cas où seul un suivi
 * client est possible (pas de webhook côté serveur).
 */
export function trackPurchase(params: {
  transactionId: string;
  value: number;
  shipping?: number;
  discount?: number;
  items: AnalyticsItem[];
}) {
  track("purchase", {
    transaction_id: params.transactionId,
    currency: "EUR",
    value: params.value,
    shipping: params.shipping,
    discount: params.discount,
    items: params.items,
  });
}
