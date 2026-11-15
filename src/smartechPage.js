/**
 * Customer-style Smartech page announce helper.
 * Call from a page component on mount with that page's fixed type.
 * Assumes create/register/identify already ran in index.html.
 *
 * @param {string} type - e.g. 'home page', 'search results'
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
  console.log('%c[Smartech] page', 'color: #30d158; font-weight: bold;', { type });
}
