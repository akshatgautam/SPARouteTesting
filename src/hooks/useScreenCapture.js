// import * as htmlToImage from 'html-to-image';

// // Fluid scalable SVG placeholder (No hardcoded 100x100 limits)
// const DEFAULT_PLACEHOLDER =
//   'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none"%3E%3Crect width="1" height="1" fill="%23e2e8f0"/%3E%3C/svg%3E';

// /**
//  * Captures a full-page screenshot preserving personalization elements.
//  * Operates on a hidden iframe clone — the live page is never mutated.
//  */
// export async function capturePersonalization(options = {}) {
//   const {
//     widgetSelector = '[data-personalization-widget]',
//     placeholderImage = DEFAULT_PLACEHOLDER,
//     maxHeight = 8000,
//     timeoutMs = 15000,
//     quality = 0.85,
//     mimeType = 'image/webp',
//     lib = htmlToImage
//   } = options;

//   const docEl = document.documentElement;

//   // Helper to identify personalization widget nodes
//   const isWidgetNode = (node) => {
//     if (!(node instanceof Element)) return false;
//     try {
//       if (typeof widgetSelector === 'function') return widgetSelector(node);
//       return node.matches(widgetSelector) || !!node.closest(widgetSelector);
//     } catch (_) {
//       return false;
//     }
//   };

//   // 1. Wait for fonts
//   try {
//     if (document.fonts?.ready) {
//       await Promise.race([
//         document.fonts.ready,
//         new Promise((res) => setTimeout(res, 1500))
//       ]);
//     }
//   } catch (_) { }

//   // 2. Measure full-page dimensions from the live document (before any cloning)
//   const scrollWidth = docEl.scrollWidth || window.innerWidth;
//   const fullScrollHeight = docEl.scrollHeight || window.innerHeight;
//   const captureHeight = Math.min(fullScrollHeight, maxHeight);

//   // 3. Snapshot live image dimensions BEFORE cloning so we can stamp them on
//   //    the clone — prevents layout collapse when we swap to placeholder srcs.
//   const liveImages = Array.from(document.querySelectorAll('img'));
//   const imageDimensions = liveImages.map((img) => {
//     const rect = img.getBoundingClientRect();
//     return { width: rect.width, height: rect.height };
//   });

//   // 4. Clone docEl and strip scripts/noscript/template to prevent re-execution
//   const clonedEl = docEl.cloneNode(true);
//   clonedEl.querySelectorAll('script, noscript, template').forEach((el) => el.remove());

//   // 5. Create a hidden off-screen iframe sized to the full page
//   const iframe = document.createElement('iframe');
//   iframe.style.cssText = [
//     'position:fixed',
//     'top:0',
//     `left:-${scrollWidth + 10}px`,
//     `width:${scrollWidth}px`,
//     `height:${captureHeight}px`,
//     'border:none',
//     'pointer-events:none',
//     'visibility:hidden'
//   ].join(';');
//   document.body.appendChild(iframe);

//   // Tick: let the iframe initialize its contentDocument
//   await new Promise((res) => setTimeout(res, 0));

//   const iframeDoc = iframe.contentDocument;
//   const iframeWin = iframe.contentWindow;

//   // 6. Move the clone into the iframe (adoptNode transfers ownership)
//   iframeDoc.replaceChild(iframeDoc.adoptNode(clonedEl), iframeDoc.documentElement);

//   // 7. Inject CSS into the iframe clone: pause animations, fix text gradients
//   const styleEl = iframeDoc.createElement('style');
//   styleEl.textContent = `
//     *, *::before, *::after {
//       animation-play-state: paused !important;
//       transition: none !important;
//     }
//     noscript, script, style, iframe, template {
//       display: none !important;
//     }
//     [style*="background-clip: text"], [style*="-webkit-background-clip: text"] {
//       -webkit-text-fill-color: initial !important;
//       color: inherit !important;
//     }
//   `;
//   (iframeDoc.head || iframeDoc.documentElement).appendChild(styleEl);

//   // 8. Stamp live image dimensions onto cloned images, then swap to placeholder.
//   //    Index-based match is safe: cloneNode(true) preserves DOM order exactly.
//   const iframeImages = Array.from(iframeDoc.querySelectorAll('img'));
//   iframeImages.forEach((img, i) => {
//     const dims = imageDimensions[i];
//     if (dims) {
//       if (dims.width > 0) img.style.width = `${dims.width}px`;
//       if (dims.height > 0) img.style.height = `${dims.height}px`;
//     }
//     if (!isWidgetNode(img) && placeholderImage) {
//       img.setAttribute('src', placeholderImage);
//       img.removeAttribute('srcset');
//     }
//   });

//   // Cleanup: just remove the iframe — live page was never mutated
//   const cleanup = () => {
//     if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
//   };

//   // 9. Build filter against the iframe DOM.
//   //    iframe scrollY is always 0, so getBoundingClientRect() == document-relative.
//   //    Use iframeWin.getComputedStyle so styles resolve against the iframe CSSOM.
//   const filter = (node) => {
//     if (!(node instanceof iframeWin.Element)) return true;

//     const tagName = node.tagName.toUpperCase();
//     if (['IFRAME', 'NOSCRIPT', 'SCRIPT', 'TEMPLATE', 'STYLE'].includes(tagName)) {
//       return false;
//     }

//     const style = iframeWin.getComputedStyle(node);
//     if (style.display === 'none' || style.visibility === 'hidden') {
//       return false;
//     }

//     // iframe.scrollY is always 0, so rect.top IS the document-relative top
//     if (style.position !== 'fixed' && style.position !== 'sticky') {
//       const rect = node.getBoundingClientRect();
//       if (rect.width > 0 && rect.height > 0) {
//         if (rect.top >= captureHeight || rect.top + rect.height <= 0) {
//           return false;
//         }
//       }
//     }

//     return true;
//   };

//   // 10. Capture execution helper — targets iframe's documentElement
//   const executeCapture = async (height) => {
//     const opts = {
//       width: scrollWidth,
//       height: height,
//       pixelRatio: 1,
//       quality,
//       type: mimeType,
//       filter,
//       fetchOptions: { mode: 'cors' },
//       cacheBust: false
//     };

//     try {
//       return await lib.toBlob(iframeDoc.documentElement, opts);
//     } catch (err) {
//       if (mimeType !== 'image/jpeg') {
//         return await lib.toBlob(iframeDoc.documentElement, { ...opts, type: 'image/jpeg' });
//       }
//       throw err;
//     }
//   };

//   // 11. Execute with timeout & viewport fallback
//   let blob = null;
//   let captureMode = 'full';

//   try {
//     let timerId;
//     const timeoutPromise = new Promise((_, reject) => {
//       timerId = setTimeout(() => reject(new Error('CAPTURE_TIMEOUT')), timeoutMs);
//     });

//     blob = await Promise.race([
//       executeCapture(captureHeight).finally(() => clearTimeout(timerId)),
//       timeoutPromise
//     ]);
//   } catch (err) {
//     if (err.message === 'CAPTURE_TIMEOUT') {
//       captureMode = 'viewport_fallback';
//       blob = await executeCapture(window.innerHeight);
//     } else {
//       cleanup();
//       throw err;
//     }
//   } finally {
//     cleanup();
//   }

//   return { blob, captureMode };
// }

import * as htmlToImage from 'html-to-image';

const DEFAULT_PLACEHOLDER =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none"%3E%3Crect width="1" height="1" fill="%23e2e8f0"/%3E%3C/svg%3E';

/**
 * Fast DOM traversal using TreeWalker to discover scrollable containers
 * while skipping non-layout elements and deep SVG/Form structures.
 */
function findScrollableElements(win = window) {
  const doc = win.document;
  const scrollables = [];

  // Define tags that can NEVER host scrollable child containers
  const SKIP_SUBTREES = new Set([
    'SVG', 'CANVAS', 'IFRAME', 'AUDIO', 'VIDEO', 'OBJECT',
    'EMBED', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE',
    'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'
  ]);

  const walker = doc.createTreeWalker(
    doc.body || doc.documentElement,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        const tagName = node.tagName.toUpperCase();

        // Skip entire subtrees for non-container or heavy graphics elements
        if (SKIP_SUBTREES.has(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        // Fast height check: if it doesn't overflow vertically, accept it 
        // to walk its children, but we won't process its styles.
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let currentNode = walker.currentNode;

  while (currentNode) {
    // 1. Fast preliminary check on layout dimensions
    if (currentNode.scrollHeight > currentNode.clientHeight && currentNode.clientHeight > 0) {
      // 2. Only compute style when we know height is overflowing
      const style = win.getComputedStyle(currentNode);
      const overflowY = style.overflowY;

      if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
        scrollables.push(currentNode);
      }
    }

    currentNode = walker.nextNode();
  }

  return scrollables;
}

export async function capturePersonalization(options = {}) {
  const {
    widgetSelector = '[data-personalization-widget]',
    placeholderImage = DEFAULT_PLACEHOLDER,
    maxHeight = 8000,
    timeoutMs = 15000,
    quality = 0.85,
    mimeType = 'image/webp',
    lib = htmlToImage
  } = options;

  const docEl = document.documentElement;

  const isWidgetNode = (node) => {
    // FIX: Cross-iframe safe element check. nodeType === 1 means it's an Element.
    if (!node || node.nodeType !== 1) return false;
    try {
      if (typeof widgetSelector === 'function') return widgetSelector(node);
      return node.matches(widgetSelector) || !!node.closest(widgetSelector);
    } catch (_) {
      return false;
    }
  };

  // 1. Wait for fonts
  try {
    if (document.fonts?.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((res) => setTimeout(res, 1500))
      ]);
    }
  } catch (_) { }

  // 2. DYNAMICALLY DETECT SCROLL CONTAINERS ON LIVE PAGE
  const liveScrollables = findScrollableElements(window);

  let fullScrollHeight = docEl.scrollHeight || window.innerHeight;

  // Calculate true capture height by taking the max depth of all scrollable elements
  for (const el of liveScrollables) {
    const rect = el.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;
    const elementMaxBottom = absoluteTop + el.scrollHeight;
    if (elementMaxBottom > fullScrollHeight) {
      fullScrollHeight = elementMaxBottom;
    }
  }

  const captureHeight = Math.min(fullScrollHeight, maxHeight);

  // 3. Measure live images & tag scrollable elements so we can target them in the clone
  const liveImages = Array.from(document.querySelectorAll('img'));
  const imageDimensions = liveImages.map((img) => {
    const rect = img.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });

  // Tag live scrollable elements with a temporary dataset attribute before cloning
  liveScrollables.forEach((el, index) => {
    el.setAttribute('data-capture-auto-expand', index.toString());
  });

  // 4. Clone docEl
  const clonedEl = docEl.cloneNode(true);
  clonedEl.querySelectorAll('script, noscript, template').forEach((el) => el.remove());

  // Cleanup temporary attributes from the live page immediately
  liveScrollables.forEach((el) => {
    el.removeAttribute('data-capture-auto-expand');
  });

  // 5. Create a hidden wrapper in the live DOM
  const cloneWrapper = document.createElement('div');
  const scrollWidth = docEl.scrollWidth || window.innerWidth;
  // Use position:fixed so the wrapper is always viewport-relative and never
  // scrolled. A large negative left keeps it off-screen without clipping the
  // painted content (overflow:hidden would cut everything below the fold).
  cloneWrapper.style.cssText = [
    'position: fixed',
    'top: 0',
    `left: -${scrollWidth + 9999}px`,
    `width: ${scrollWidth}px`,
    // Tall enough for the full content — no overflow clip.
    `min-height: ${captureHeight}px`,
    'z-index: -9999',
    'pointer-events: none',
    'visibility: visible',
    'overflow: visible'
  ].join(';');

  // Force the cloned <html> element itself to the required height so its
  // internal layout engine allocates space for all below-fold content.
  clonedEl.style.width = `${scrollWidth}px`;
  clonedEl.style.minHeight = `${captureHeight}px`;
  clonedEl.style.height = `${captureHeight}px`;
  clonedEl.style.overflow = 'visible';

  // Add the clone to the wrapper, then the wrapper to the body
  cloneWrapper.appendChild(clonedEl);
  document.body.appendChild(cloneWrapper);

  // 6. Inject dynamic CSS directly into the clone
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    *, *::before, *::after {
      animation-play-state: paused !important;
      transition: none !important;
    }
    /* We keep the wrapper visible, but hide scripts/templates inside the clone */
    noscript, script, template {
      display: none !important;
    }
    [style*="background-clip: text"], [style*="-webkit-background-clip: text"] {
      -webkit-text-fill-color: initial !important;
      color: inherit !important;
    }
    [data-capture-auto-expand] {
      overflow: visible !important;
      height: max-content !important;
      max-height: none !important;
      flex: none !important;
    }
  `;
  clonedEl.appendChild(styleEl);

  // 7. Stamp live image dimensions & apply placeholder logic
  const iframeImages = Array.from(clonedEl.querySelectorAll('img'));
  iframeImages.forEach((img, i) => {
    const dims = imageDimensions[i];
    if (dims) {
      if (dims.width > 0) img.style.width = `${dims.width}px`;
      if (dims.height > 0) img.style.height = `${dims.height}px`;
    }
    if (!isWidgetNode(img) && placeholderImage) {
      img.setAttribute('src', placeholderImage);
      img.removeAttribute('srcset');
    }
  });

  const cleanup = () => {
    if (cloneWrapper.parentNode) cloneWrapper.remove();
  };

  // 8. Filter non-visible elements
  // - Clone is in the same document, so node instanceof window.Element works.
  // - We do NOT call window.getComputedStyle for visibility: the clone is
  //   off-screen, so the browser often returns misleading values (e.g.
  //   visibility:hidden) for content that is perfectly renderable. html-to-image
  //   handles its own visibility pass internally.
  // - STYLE nodes are intentionally kept so html-to-image can inline CSS rules.
  const filter = (node) => {
    if (!(node instanceof window.Element)) return true;

    const tagName = node.tagName.toUpperCase();
    if (['IFRAME', 'NOSCRIPT', 'SCRIPT', 'TEMPLATE'].includes(tagName)) {
      return false;
    }

    return true;
  };

  // 9. Execute capture
  const executeCapture = async (height) => {
    const opts = {
      width: scrollWidth,
      height: height,
      pixelRatio: 1,
      quality,
      type: mimeType,
      filter,
      fetchOptions: { mode: 'cors' },
      cacheBust: false
    };

    try {
      return await lib.toBlob(clonedEl, opts);
    } catch (err) {
      if (mimeType !== 'image/jpeg') {
        return await lib.toBlob(clonedEl, { ...opts, type: 'image/jpeg' });
      }
      throw err;
    }
  };

  let blob = null;
  let captureMode = 'full';

  try {
    let timerId;
    const timeoutPromise = new Promise((_, reject) => {
      timerId = setTimeout(() => reject(new Error('CAPTURE_TIMEOUT')), timeoutMs);
    });

    blob = await Promise.race([
      executeCapture(captureHeight).finally(() => clearTimeout(timerId)),
      timeoutPromise
    ]);
  } catch (err) {
    if (err.message === 'CAPTURE_TIMEOUT') {
      captureMode = 'viewport_fallback';
      blob = await executeCapture(window.innerHeight);
    } else {
      cleanup();
      throw err;
    }
  } finally {
    cleanup();
  }

  return { blob, captureMode };
}