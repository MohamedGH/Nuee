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
