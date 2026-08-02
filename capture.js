(() => {
    async function captureFullPageStream() {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            preferCurrentTab: true,
            surfaceSwitching: 'exclude',
            systemAudio: 'exclude',
            video: { displaySurface: 'browser' },
            audio: false
        });

        const video = document.createElement('video');
        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;

        // Keep in viewport with 0.01 opacity to prevent Safari pipeline suspension
        Object.assign(video.style, {
            position: 'fixed', bottom: '0', right: '0',
            width: '1px', height: '1px', opacity: '0.01',
            pointerEvents: 'none', zIndex: '-9999'
        });
        document.body.appendChild(video);

        video.srcObject = stream;
        await video.play().catch(e => console.warn("Video play interrupted:", e));

        // Wait for video dimensions to populate
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            await new Promise(resolve => {
                const checkDimensions = () => {
                    if (video.videoWidth > 0) {
                        video.removeEventListener('resize', checkDimensions);
                        resolve();
                    }
                };
                video.addEventListener('resize', checkDimensions);
                setTimeout(resolve, 1000);
            });
        }

        const style = document.createElement('style');
        style.innerHTML = `
      * { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
      ::-webkit-scrollbar { display: none !important; }
    `;
        document.head.appendChild(style);

        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        // Since we request the tab, videoWidth to innerWidth is ALWAYS the correct scale
        const scale = video.videoWidth / window.innerWidth;
        const originalScrollY = window.scrollY;
        window.scrollTo(0, 0);

        const waitForReliableFrame = () => new Promise(resolve => {
            setTimeout(() => {
                if ('requestVideoFrameCallback' in video) {
                    let fired = false;
                    const handle = video.requestVideoFrameCallback(() => {
                        fired = true;
                        resolve();
                    });
                    setTimeout(() => {
                        if (!fired) {
                            video.cancelVideoFrameCallback(handle);
                            resolve();
                        }
                    }, 300);
                } else {
                    setTimeout(resolve, 150);
                }
            }, 150);
        });

        await waitForReliableFrame();

        const frames = [];
        let previousScrollY = -1;

        // Safari-specific intermediary buffer to prevent WebKit crashing on raw video bitmaps
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Scroll and Extract Loop
        while (true) {
            const currentScrollY = window.scrollY;
            if (currentScrollY === previousScrollY) break;

            let frameBitmap;

            if (isSafari) {
                // Buffer through canvas first to sanitize the frame for Safari's GPU
                if (tempCanvas.width !== video.videoWidth) {
                    tempCanvas.width = video.videoWidth;
                    tempCanvas.height = video.videoHeight;
                }
                tempCtx.drawImage(video, 0, 0);
                frameBitmap = await createImageBitmap(tempCanvas);
            } else {
                // Chrome/Firefox can extract a hardware bitmap directly from the video track
                frameBitmap = await createImageBitmap(video);
            }

            frames.push({ y: currentScrollY, img: frameBitmap });

            previousScrollY = currentScrollY;
            window.scrollTo(0, currentScrollY + window.innerHeight);

            await waitForReliableFrame();
        }

        // Stitching Phase
        const lastFrame = frames[frames.length - 1];
        let finalHeight = Math.ceil((lastFrame.y * scale) + video.videoHeight);
        let finalWidth = Math.ceil(video.videoWidth);

        // Safari Megapixel Limit Protection (Capped at ~16k pixels tall)
        const MAX_SAFARI_HEIGHT = 16300;
        let finalScale = 1;

        if (isSafari && finalHeight > MAX_SAFARI_HEIGHT) {
            console.warn("Page exceeds Safari canvas limits. Scaling down.");
            finalScale = MAX_SAFARI_HEIGHT / finalHeight;
            finalHeight = MAX_SAFARI_HEIGHT;
            finalWidth = finalWidth * finalScale;
        }

        const canvas = document.createElement('canvas');
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (finalScale !== 1) {
            ctx.scale(finalScale, finalScale);
        }

        // Draw perfectly contiguous frames
        for (const frame of frames) {
            ctx.drawImage(frame.img, 0, frame.y * scale);
            frame.img.close(); // Prevent memory leaks by flushing the bitmap
        }

        // Cleanup
        document.head.removeChild(style);
        document.body.removeChild(video);
        window.scrollTo(0, originalScrollY);
        stream.getTracks().forEach(track => track.stop());

        // 1. Calculate if the user has a High-DPI (Retina) display
        const pixelRatio = video.videoWidth / window.innerWidth;

        // 2. If it's a retina display (> 1.5x), scale the final canvas down by half
        // This eliminates 75% of the total pixels while keeping standard 1x legibility
        if (pixelRatio > 1.5) {
            const scaledCanvas = document.createElement('canvas');
            scaledCanvas.width = canvas.width / 2;
            scaledCanvas.height = canvas.height / 2;
            const scaledCtx = scaledCanvas.getContext('2d');

            // Draw the massive canvas onto the smaller one using smooth interpolation
            scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

            // Export as WebP at 75% quality
            return scaledCanvas.toDataURL('image/webp', 0.75);
        }

        // 3. Standard export for regular 1080p monitors
        // Export as WebP at 80% quality
        return canvas.toDataURL('image/webp', 0.80);
        // return canvas.toDataURL('image/png');
    }

    // --- UI Injection ---
    const btn = document.createElement('button');
    btn.innerHTML = '📸 Capture Page';
    Object.assign(btn.style, {
        position: 'fixed', bottom: '20px', right: '20px', zIndex: '999999',
        padding: '12px 24px', backgroundColor: '#000000', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer'
    });
    document.body.appendChild(btn);

    btn.addEventListener('click', async () => {
        try {
            btn.innerHTML = '⏳ Capturing...';
            btn.disabled = true;

            const dataUrl = await captureFullPageStream();

            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `page-capture-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            btn.innerHTML = '✅ Done!';
            setTimeout(() => { btn.innerHTML = '📸 Capture Page'; btn.disabled = false; }, 3000);
        } catch (err) {
            console.error(err);
            alert('Capture failed. Check console.');
            btn.innerHTML = '❌ Failed';
            setTimeout(() => { btn.innerHTML = '📸 Capture Page'; btn.disabled = false; }, 3000);
        }
    });
})();