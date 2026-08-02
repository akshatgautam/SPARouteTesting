const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://www.thesouledstore.com/men';
const OUTPUT_PATH = path.resolve(__dirname, 'capture_output.png');

(async () => {
  const t0 = Date.now();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',       // relax CORS for html-to-image inlining
      '--allow-file-access-from-files'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log(`Navigating to ${TARGET_URL} ...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });

  // Inject html-to-image UMD bundle from CDN
  await page.addScriptTag({
    url: 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js'
  });
  // Give the UMD bundle a moment to register on window
  await new Promise(r => setTimeout(r, 500));

  console.log('Running capturePersonalization on the page...');

  const result = await page.evaluate(async () => {
    try {
      /* ---- capturePersonalization inlined (adapted from useScreenCapture.js) ---- */
      const htmlToImage = window.htmlToImage;
      if (!htmlToImage) return { error: 'html-to-image not loaded', step: 1 };

    const DEFAULT_PLACEHOLDER =
      'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none"%3E%3Crect width="1" height="1" fill="%23e2e8f0"/%3E%3C/svg%3E';

    const widgetSelector = '[data-personalization-widget]';
    const placeholderImage = DEFAULT_PLACEHOLDER;
    const maxHeight = 8000;
    const timeoutMs = 30000;
    const quality = 0.85;
    const mimeType = 'image/png';  // PNG for lossless clarity

    const docEl = document.documentElement;
    console.log('Step 3: Got document element');

    const isWidgetNode = (node) => {
      if (!node || node.nodeType !== 1) return false;
      try {
        return node.matches(widgetSelector) || !!node.closest(widgetSelector);
      } catch (_) { return false; }
    };

    // Wait for fonts
    try {
      if (document.fonts?.ready) {
        await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]);
      }
    } catch (_) {}
    console.log('Step 4: Fonts waited');

    // Find scrollable elements
    function findScrollableElements(win) {
      const doc = win.document;
      const scrollables = [];
      const SKIP = new Set(['SVG','CANVAS','IFRAME','AUDIO','VIDEO','OBJECT','EMBED','SCRIPT','STYLE','NOSCRIPT','TEMPLATE','INPUT','TEXTAREA','SELECT','BUTTON']);
      const walker = doc.createTreeWalker(doc.body || doc.documentElement, NodeFilter.SHOW_ELEMENT, {
        acceptNode(node) {
          return SKIP.has(node.tagName.toUpperCase()) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      });
      let cur = walker.currentNode;
      while (cur) {
        if (cur.scrollHeight > cur.clientHeight && cur.clientHeight > 0) {
          const s = win.getComputedStyle(cur);
          if (['auto','scroll','overlay'].includes(s.overflowY)) scrollables.push(cur);
        }
        cur = walker.nextNode();
      }
      return scrollables;
    }

    const liveScrollables = findScrollableElements(window);
    console.log('Step 5: Found scrollables:', liveScrollables.length);
    let fullScrollHeight = docEl.scrollHeight || window.innerHeight;
    for (const el of liveScrollables) {
      const rect = el.getBoundingClientRect();
      const absTop = rect.top + window.scrollY;
      const bottom = absTop + el.scrollHeight;
      if (bottom > fullScrollHeight) fullScrollHeight = bottom;
    }
    const captureHeight = Math.min(fullScrollHeight, maxHeight);
    const scrollWidth = docEl.scrollWidth || window.innerWidth;
    console.log('Step 6: Calculated dimensions');

    // Measure images and determine above/below fold status
    const liveImages = Array.from(document.querySelectorAll('img'));
    const viewportHeight = window.innerHeight;
    const imageDimensions = liveImages.map(img => {
      const r = img.getBoundingClientRect();
      return {
        width: r.width,
        height: r.height,
        isAboveFold: r.top <= viewportHeight
      };
    });

    // Tag scrollables
    liveScrollables.forEach((el, i) => el.setAttribute('data-capture-auto-expand', i.toString()));

    // Clone
    const clonedEl = docEl.cloneNode(true);
    clonedEl.querySelectorAll('script, noscript, template').forEach(el => el.remove());

    // Cleanup live tags
    liveScrollables.forEach(el => el.removeAttribute('data-capture-auto-expand'));

    // Hidden wrapper
    const cloneWrapper = document.createElement('div');
    cloneWrapper.style.cssText = [
      'position: fixed', 'top: 0',
      `left: -${scrollWidth + 9999}px`,
      `width: ${scrollWidth}px`,
      `min-height: ${captureHeight}px`,
      'z-index: -9999', 'pointer-events: none',
      'visibility: visible', 'overflow: visible'
    ].join(';');

    clonedEl.style.width = `${scrollWidth}px`;
    clonedEl.style.minHeight = `${captureHeight}px`;
    clonedEl.style.height = `${captureHeight}px`;
    clonedEl.style.overflow = 'visible';

    cloneWrapper.appendChild(clonedEl);
    document.body.appendChild(cloneWrapper);

    // Inject CSS into clone
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      *, *::before, *::after { animation-play-state: paused !important; transition: none !important; }
      noscript, script, template { display: none !important; }
      [style*="background-clip: text"], [style*="-webkit-background-clip: text"] {
        -webkit-text-fill-color: initial !important; color: inherit !important;
      }
      [data-capture-auto-expand] {
        overflow: visible !important; height: max-content !important;
        max-height: none !important; flex: none !important;
      }
    `;
    clonedEl.appendChild(styleEl);

    // Stamp image dimensions + placeholders
    const clonedImages = Array.from(clonedEl.querySelectorAll('img'));
    console.log('Processing images, count:', clonedImages.length);
    clonedImages.forEach((img, i) => {
      const dims = imageDimensions[i];
      if (dims) {
        if (dims.width > 0) img.style.width = `${dims.width}px`;
        if (dims.height > 0) img.style.height = `${dims.height}px`;
      }
      // Only replace images below the fold with placeholders
      if (!isWidgetNode(img) && placeholderImage) {
        const dims = imageDimensions[i];
        if (dims && !dims.isAboveFold) {
          img.setAttribute('src', placeholderImage);
          img.removeAttribute('srcset');
        } else if (dims && dims.isAboveFold) {
          // Add crossorigin to images above the fold to prevent tainted canvas
          img.setAttribute('crossorigin', 'anonymous');
        }
      }
    });
    console.log('Image processing complete');

    const cleanup = () => { if (cloneWrapper.parentNode) cloneWrapper.remove(); };

    const filter = (node) => {
      if (!(node instanceof window.Element)) return true;
      const tag = node.tagName.toUpperCase();
      return !['IFRAME','NOSCRIPT','SCRIPT','TEMPLATE'].includes(tag);
    };

    const executeCapture = async (height) => {
      const opts = {
        width: scrollWidth, height, pixelRatio: 1, quality,
        type: mimeType, filter,
        fetchOptions: { mode: 'cors' }, cacheBust: false,
        useCORS: true
      };
      try {
        return await htmlToImage.toBlob(clonedEl, opts);
      } catch (err) {
        if (mimeType !== 'image/jpeg') {
          return await htmlToImage.toBlob(clonedEl, { ...opts, type: 'image/jpeg' });
        }
        throw err;
      }
    };

    let blob = null;
    let captureMode = 'full';
    const captureStart = performance.now();

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

    const captureEnd = performance.now();

    if (!blob) throw new Error('Capture returned null blob');

    // Convert blob to base64
    const arrayBuffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
    const base64 = btoa(binary);

    return {
      base64,
      captureMode,
      captureTimeMs: Math.round(captureEnd - captureStart),
      dimensions: { width: scrollWidth, height: captureHeight },
      blobSize: blob.size
    };
    } catch (err) {
      return { error: String(err), isError: true };
    }
  });

  const totalMs = Date.now() - t0;

  console.log('Result keys:', Object.keys(result));
  console.log('Has error:', !!result.error);

  // Check for error from page.evaluate
  if (result.error || result.isError) {
    console.error('Error inside page.evaluate:', result.error);
    await browser.close();
    process.exit(1);
  }

  // Save the image
  const buffer = Buffer.from(result.base64, 'base64');
  fs.writeFileSync(OUTPUT_PATH, buffer);

  console.log(`\n=== CAPTURE COMPLETE ===`);
  console.log(`Mode:       ${result.captureMode}`);
  console.log(`Dimensions: ${result.dimensions.width} x ${result.dimensions.height}`);
  console.log(`Blob size:  ${(result.blobSize / 1024).toFixed(1)} KB`);
  console.log(`Capture fn: ${(result.captureTimeMs / 1000).toFixed(2)}s`);
  console.log(`Total time: ${(totalMs / 1000).toFixed(2)}s`);
  console.log(`Saved to:   ${OUTPUT_PATH}`);

  await browser.close();
})().catch(err => {
  console.error('FATAL:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});
