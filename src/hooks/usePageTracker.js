import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../sdk';

/**
 * Custom hook to monitor all WebSDK tracking scenarios:
 * 1. Hash changes (via router links)
 * 2. History API pushState/replaceState
 * 3. Programmatic navigation
 * 4. Back/Forward (popstate)
 * 5. Dynamic route parameter changes
 * 6. Query string changes
 * 7. In-page anchor changes
 * 8. Tab/page visibility changes
 */
export function usePageTracker() {
  const location = useLocation();

  const prevPathname = useRef(location.pathname);
  const prevSearch = useRef(location.search);
  const prevHash = useRef(location.hash);
  const isInitialMounted = useRef(false);

  // Track initial hard page load (first pageview)
  useEffect(() => {
    if (!isInitialMounted.current) {
      trackEvent('pageview', {
        type: 'initial_load',
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        title: document.title,
      });
      isInitialMounted.current = true;
    }
  }, []);

  // Track dynamic navigation changes
  useEffect(() => {
    // 1. Pathname route change (handles standard nav links, programmatic navigation, dynamic params)
    if (location.pathname !== prevPathname.current) {
      trackEvent('pageview', {
        type: 'route_change',
        pathname: location.pathname,
        prevPathname: prevPathname.current,
        search: location.search,
        hash: location.hash,
      });
      prevPathname.current = location.pathname;
    }

    // 2. Query string parameter changes (e.g. switching tabs ?tab=details)
    if (location.search !== prevSearch.current) {
      trackEvent('querychange', {
        search: location.search,
        prevSearch: prevSearch.current,
        pathname: location.pathname,
      });
      prevSearch.current = location.search;
    }

    // 3. In-page anchor transitions (e.g. linking to #/about#section-a)
    if (location.hash !== prevHash.current) {
      trackEvent('anchorchange', {
        hash: location.hash,
        prevHash: prevHash.current,
        pathname: location.pathname,
      });
      prevHash.current = location.hash;
    }

    // Smooth scroll to anchor if present in URL hash
    if (location.hash) {
      // Decode URL in case of special characters, slice off the leading #
      const elementId = decodeURIComponent(location.hash.substring(1));
      // In react router HashRouter, the hash contains route, so we might need to parse.
      // E.g., if url is `#/about#section-a`, react router location.hash is `#section-a`
      const element = document.getElementById(elementId);
      if (element) {
        // Delay slightly to allow component rendering if necessary
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  // Hook into browser APIs and document events
  useEffect(() => {
    // 4. Back / Forward button actions (popstate)
    const handlePopState = (event) => {
      trackEvent('popstate', {
        url: window.location.hash || '#/',
        state: event.state,
      });
    };

    // 5. Intercept explicit pushState
    const handlePushState = (event) => {
      trackEvent('pushstate', {
        url: event.detail.url,
        state: event.detail.state,
      });
    };

    // 6. Intercept explicit replaceState
    const handleReplaceState = (event) => {
      trackEvent('replacestate', {
        url: event.detail.url,
        state: event.detail.state,
      });
    };

    // 7. Page visibility (tabbing away or minimizing browser)
    const handleVisibilityChange = () => {
      trackEvent('visibility', {
        visibilityState: document.visibilityState,
      });
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pushstate', handlePushState);
    window.addEventListener('replacestate', handleReplaceState);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pushstate', handlePushState);
      window.removeEventListener('replacestate', handleReplaceState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
export default usePageTracker;
