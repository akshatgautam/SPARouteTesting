/**
 * Safe wrappers around Netcore CE (Smartech) system events.
 * create / register / identify stay in index.html. These helpers only dispatch.
 */

/** Matches formatPrice() in src/data/products.js. */
export const SMARTECH_CURRENCY = 'USD';

const INTEGER_PAYLOAD_KEYS = new Set(['prqt']);
const FLOAT_PAYLOAD_KEYS = new Set(['price']);

/** Collapses React StrictMode's double-invoked effects without swallowing a later visit. */
const DEDUPE_MS = 100;
const recentDispatches = new Map();

/**
 * @typedef {Object} SmartechProduct
 * @property {string|number} id
 * @property {string} [name]
 * @property {string} [category]
 * @property {number|string} [price]
 * @property {string} [image]
 * @property {string} [imageUrl]
 */

/**
 * @returns {boolean}
 */
export function isSmartechReady() {
  return typeof window !== 'undefined' && typeof window.smartech === 'function';
}

/**
 * @param {unknown} value
 * @returns {number}
 */
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * @param {unknown} value
 * @returns {number}
 */
function toInteger(value) {
  return Math.trunc(toNumber(value));
}

/**
 * Lowercase every key. price stays a float; prqt stays an integer.
 * @param {Record<string, unknown> | null | undefined} payload
 * @returns {Record<string, unknown>}
 */
export function normalizeSmartechPayload(payload) {
  const normalized = {};
  if (!payload || typeof payload !== 'object') return normalized;

  for (const [rawKey, value] of Object.entries(payload)) {
    const key = String(rawKey).toLowerCase();
    if (INTEGER_PAYLOAD_KEYS.has(key)) {
      normalized[key] = toInteger(value);
    } else if (FLOAT_PAYLOAD_KEYS.has(key)) {
      normalized[key] = toNumber(value);
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
}

/**
 * @param {string} key
 * @returns {boolean}
 */
function isDuplicateDispatch(key) {
  const now = Date.now();
  const previous = recentDispatches.get(key);
  if (previous != null && now - previous < DEDUPE_MS) return true;
  recentDispatches.set(key, now);
  return false;
}

/**
 * @param {string} eventName
 * @param {Record<string, unknown>} [payload]
 * @returns {boolean} Whether the event was handed to the SDK.
 */
export function dispatchSmartech(eventName, payload = {}) {
  if (!isSmartechReady()) {
    console.warn('[Smartech] dispatch skipped — smartech() not available', {
      event: eventName,
    });
    return false;
  }

  const event = String(eventName).toLowerCase();
  const normalized = normalizeSmartechPayload(payload);
  window.smartech('dispatch', event, normalized);
  console.log(
    '%c[Smartech] dispatch',
    'color: #0d7a6f; font-weight: bold;',
    event,
    normalized
  );
  return true;
}

/**
 * System event: page browse.
 * Fires with the current absolute URL.
 * @returns {boolean}
 */
export function trackPageBrowse() {
  if (typeof window === 'undefined') return false;

  const pageUrl = window.location.href;
  if (isDuplicateDispatch(`page browse:${pageUrl}`)) return false;

  return dispatchSmartech('page browse', { page_url: pageUrl });
}

/**
 * System event: add to cart.
 * prqt is the quantity added in this action, not the new line total.
 * @param {SmartechProduct | null | undefined} product
 * @param {number} quantity
 * @returns {boolean}
 */
export function trackAddToCart(product, quantity) {
  const prqt = toInteger(quantity);
  if (!product || product.id == null || prqt <= 0) return false;

  return dispatchSmartech('add to cart', {
    prid: String(product.id),
    prqt,
    prname: String(product.name ?? ''),
    category: String(product.category ?? ''),
    price: toNumber(product.price),
    currency: SMARTECH_CURRENCY,
    productimage: String(product.imageUrl || product.image || ''),
  });
}

/**
 * System event: checkout.
 * Empty payload, per the Netcore checkout system event.
 * @returns {boolean}
 */
export function trackCheckout() {
  if (typeof window === 'undefined') return false;
  if (isDuplicateDispatch(`checkout:${window.location.href}`)) return false;

  return dispatchSmartech('checkout', {});
}
