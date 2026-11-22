import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../sdk';
import { trackPageBrowse } from '../utils/smartech';

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

  // Netcore "page browse" on the first load and on every URL change
  // (path, query, or hash). One effect so a single navigation fires once.
  useEffect(() => {
    trackPageBrowse();
  }, [location.pathname, location.search, location.hash]);

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

    // 3. In-page anchor transitions (BrowserRouter: location.hash is the fragment)
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
      const elementId = decodeURIComponent(location.hash.substring(1));
      const element = document.getElementById(elementId);
      if (element) {
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
        url: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        state: event.state,
      });
    };

    // 7. Page visibility (tabbing away or minimizing browser)
    const handleVisibilityChange = () => {
      trackEvent('visibility', {
        visibilityState: document.visibilityState,
      });
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
export default usePageTracker;
