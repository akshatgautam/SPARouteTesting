/**
 * Customer-style Smartech page announce helper.
 * Call from a page component on mount with that page's fixed type.
 * Assumes create/register/identify already ran in index.html.
 *
 * Supported types:
 * - home page
 * - product display page
 * - category/listing page
 * - cart page
 * - checkout page
 * - order confirmation page
 * - search results
 *
 * @param {string} type
 */
export function announceSmartechPage(type) {
  if (!type) return;

  if (typeof window.smartech !== 'function') {
    console.warn('[Smartech] page announce skipped — smartech() not available', {
      type,
    });
    return;
  }

  window.smartech('page', { type });
  console.log('%c[Smartech] page', 'color: #0d7a6f; font-weight: bold;', { type });
}
