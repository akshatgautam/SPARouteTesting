// src/sdk.js
const listeners = new Set();

/**
 * Register a listener to receive real-time tracked events.
 * Used by the UI Event Log panel to render events on screen.
 * @param {Function} callback - Callback function that receives the event object.
 * @returns {Function} Unsubscribe function.
 */
export const subscribeToEvents = (callback) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

/**
 * Track an SDK event.
 * If the real SDK is loaded (via window.WebSDK), it forwards the event to it.
 * Otherwise, it logs to the console and always triggers local UI listeners.
 * @param {string} type - The event type (e.g. 'pageview', 'querychange', etc.)
 * @param {Object} payload - Event metadata.
 */
export const trackEvent = (type, payload) => {
  const currentPath = window.location.hash || '#/';
  
  const event = {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    type,
    payload: {
      ...payload,
      title: document.title,
    },
    url: currentPath,
  };

  // 1. Alert UI listeners
  listeners.forEach((callback) => {
    try {
      callback(event);
    } catch (err) {
      console.error('Error in event listener:', err);
    }
  });

  // 2. Default console logging (safe fallback)
  console.log(`%c[SDK Event] ${type.toUpperCase()}`, 'color: #00ffcc; font-weight: bold;', {
    url: event.url,
    ...event.payload
  });
};
