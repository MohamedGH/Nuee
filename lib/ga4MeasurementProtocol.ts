// L'API secret ne doit jamais être exposée au client — c'est pourquoi ce
// module est strictement serveur (jamais importé depuis un composant client).
const MP_ENDPOINT = "https://www.google-analytics.com/mp/collect";

export type MpItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity?: number;
};

/**
 * Envoie un événement GA4 directement depuis le serveur, sans passer par
 * le navigateur. Contrairement au suivi côté client (gtag.js), ça ne
 * dépend ni d'un script qui a pu être bloqué, ni d'un onglet resté ouvert
 * assez longtemps pour que la requête parte — pertinent pour un événement
 * qui compte du chiffre d'affaires.
 *
 * Nécessite GA4_API_SECRET (généré dans GA4 → Admin → Flux de données →
 * Measurement Protocol API secrets) et un client_id capturé côté
 * navigateur (voir lib/analytics.ts:getGaClientId) pour que l'événement
 * s'attribue à la bonne session plutôt que d'apparaître orphelin.
 */
export async function sendServerSideEvent(params: {
  measurementId: string;
  apiSecret: string;
  clientId: string;
  eventName: string;
  eventParams: Record<string, unknown>;
}): Promise<boolean> {
  const { measurementId, apiSecret, clientId, eventName, eventParams } = params;
  const url = `${MP_ENDPOINT}?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        events: [{ name: eventName, params: eventParams }],
      }),
    });
    // Le Measurement Protocol répond 204 même en cas d'événement mal
    // formé (il ne valide pas la charge utile de façon synchrone) — un
    // statut non-2xx signale au moins un problème réseau/de clé.
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendServerSidePurchase(params: {
  measurementId: string;
  apiSecret: string;
  clientId: string;
  transactionId: string;
  value: number;
  shipping?: number;
  discount?: number;
  items: MpItem[];
}): Promise<boolean> {
  return sendServerSideEvent({
    measurementId: params.measurementId,
    apiSecret: params.apiSecret,
    clientId: params.clientId,
    eventName: "purchase",
    eventParams: {
      transaction_id: params.transactionId,
      currency: "EUR",
      value: params.value,
      shipping: params.shipping,
      discount: params.discount,
      items: params.items,
    },
  });
}
