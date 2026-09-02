const DIAGRAM_ZOOM_STEPS = [1, 1.5, 2, 3, 4];
const RESUME_ZOOM_STEPS = [1, 1.25, 1.5, 2, 2.5];

function setupDiagramZoom() {
    document.querySelectorAll<HTMLElement>('.skill-diagram').forEach((diagram) => {
        const viewport = diagram.querySelector<HTMLElement>('.skill-diagram__viewport');
        const svg = viewport?.querySelector<SVGElement>('svg');
        const zoomOut = diagram.querySelector<HTMLButtonElement>('[data-diagram-zoom="out"]');
        const zoomIn = diagram.querySelector<HTMLButtonElement>('[data-diagram-zoom="in"]');
        const zoomLabel = diagram.querySelector<HTMLOutputElement>('.skill-diagram__zoom output');

        if (!viewport || !svg || !zoomOut || !zoomIn || !zoomLabel) return;

        let zoomIndex = 0;
        let fittedWidth = Math.max(svg.getBoundingClientRect().width, viewport.clientWidth);

        const renderZoom = (nextIndex: number) => {
            const previousWidth = Math.max(viewport.scrollWidth, 1);
            const centerRatio = (viewport.scrollLeft + viewport.clientWidth / 2) / previousWidth;

            zoomIndex = Math.max(0, Math.min(nextIndex, DIAGRAM_ZOOM_STEPS.length - 1));
            const zoom = DIAGRAM_ZOOM_STEPS[zoomIndex];
            svg.style.width = zoomIndex === 0 ? '100%' : `${fittedWidth * zoom}px`;

            zoomOut.disabled = zoomIndex === 0;
            zoomIn.disabled = zoomIndex === DIAGRAM_ZOOM_STEPS.length - 1;
            zoomLabel.textContent = zoomIndex === 0 ? '适配' : `${Math.round(zoom * 100)}%`;

            requestAnimationFrame(() => {
                if (zoomIndex === 0) {
                    fittedWidth = Math.max(svg.getBoundingClientRect().width, viewport.clientWidth);
                    viewport.scrollLeft = 0;
                    return;
                }

                viewport.scrollLeft = Math.max(
                    0,
                    centerRatio * viewport.scrollWidth - viewport.clientWidth / 2
                );
            });
        };

        zoomOut.addEventListener('click', () => renderZoom(zoomIndex - 1));
        zoomIn.addEventListener('click', () => renderZoom(zoomIndex + 1));

        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(() => {
                if (zoomIndex !== 0) return;
                fittedWidth = Math.max(svg.getBoundingClientRect().width, viewport.clientWidth);
            });

            resizeObserver.observe(viewport);
        }

        renderZoom(0);
    });
}

function setupResumeZoom() {
    document.querySelectorAll<HTMLElement>('[data-resume-preview]').forEach((viewport) => {
        const resume = viewport.closest<HTMLElement>('.resume-pdf');
        const stage = viewport.querySelector<HTMLElement>('[data-resume-stage]');
        const controls = resume?.querySelector<HTMLElement>('[data-resume-zoom-controls]');
        const zoomOut = controls?.querySelector<HTMLButtonElement>('[data-resume-zoom="out"]');
        const zoomIn = controls?.querySelector<HTMLButtonElement>('[data-resume-zoom="in"]');
        const zoomLabel = controls?.querySelector<HTMLOutputElement>('output');

        if (!stage || !controls || !zoomOut || !zoomIn || !zoomLabel) return;

        let zoomIndex = 0;

        const renderZoom = (nextIndex: number) => {
            const previousWidth = Math.max(viewport.scrollWidth, 1);
            const previousHeight = Math.max(viewport.scrollHeight, 1);
            const centerX = (viewport.scrollLeft + viewport.clientWidth / 2) / previousWidth;
            const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / previousHeight;

            zoomIndex = Math.max(0, Math.min(nextIndex, RESUME_ZOOM_STEPS.length - 1));
            const zoom = RESUME_ZOOM_STEPS[zoomIndex];
            stage.style.setProperty('--resume-zoom-size', `${zoom * 100}%`);

            zoomOut.disabled = zoomIndex === 0;
            zoomIn.disabled = zoomIndex === RESUME_ZOOM_STEPS.length - 1;
            zoomLabel.textContent = `${Math.round(zoom * 100)}%`;

            requestAnimationFrame(() => {
                if (zoomIndex === 0) {
                    viewport.scrollLeft = 0;
                    viewport.scrollTop = 0;
                    return;
                }

                viewport.scrollLeft = Math.max(0, centerX * viewport.scrollWidth - viewport.clientWidth / 2);
                viewport.scrollTop = Math.max(0, centerY * viewport.scrollHeight - viewport.clientHeight / 2);
            });
        };

        zoomOut.addEventListener('click', () => renderZoom(zoomIndex - 1));
        zoomIn.addEventListener('click', () => renderZoom(zoomIndex + 1));

        controls.hidden = false;
        renderZoom(0);
    });
}

function setupMemoSceneWalls() {
    document.querySelectorAll<HTMLElement>('[data-memo-scene-wall]').forEach((wall) => {
        const panel = wall.querySelector<HTMLElement>('[data-scene-detail-panel]');
        const title = wall.querySelector<HTMLElement>('[data-scene-detail-title]');
        const copy = wall.querySelector<HTMLElement>('[data-scene-detail-copy]');
        const buttons = Array.from(wall.querySelectorAll<HTMLButtonElement>('[data-scene-title]'));

        if (!panel || !title || !copy || buttons.length === 0) return;

        const closeDetail = () => {
            panel.hidden = true;
            wall.classList.remove('is-paused', 'is-interacting');
            buttons.forEach((button) => {
                button.classList.remove('is-active');
                button.setAttribute('aria-pressed', 'false');
            });
        };

        buttons.forEach((button) => {
            button.setAttribute('aria-pressed', 'false');
        });

        const openDetail = (button: HTMLButtonElement) => {
            const selectedTitle = button.dataset.sceneTitle ?? '';
            buttons.forEach((item) => {
                const isSelected = item.dataset.sceneTitle === selectedTitle;
                item.classList.toggle('is-active', isSelected);
                item.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
            });
            title.textContent = selectedTitle;
            copy.textContent = button.dataset.sceneDetail ?? '';
            panel.hidden = false;
            wall.classList.add('is-paused', 'is-interacting');
        };

        const toggleDetail = (button: HTMLButtonElement) => {
            const isCurrentScene = !panel.hidden && title.textContent === (button.dataset.sceneTitle ?? '');
            if (isCurrentScene) {
                closeDetail();
                return;
            }
            openDetail(button);
        };

        wall.addEventListener('pointerdown', (event) => {
            const target = event.target as HTMLElement | null;
            const button = target?.closest<HTMLButtonElement>('[data-scene-title]');
            if (!button || !wall.contains(button)) return;
            wall.classList.add('is-interacting');
        });

        wall.addEventListener('pointerup', () => {
            requestAnimationFrame(() => {
                if (panel.hidden) wall.classList.remove('is-interacting');
            });
        });

        wall.addEventListener('pointercancel', () => wall.classList.remove('is-interacting'));

        wall.addEventListener('click', (event) => {
            const target = event.target as HTMLElement | null;
            const button = target?.closest<HTMLButtonElement>('[data-scene-title]');
            if (!button || !wall.contains(button)) return;
            toggleDetail(button);
        });

        wall.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !panel.hidden) closeDetail();
        });
    });
}

function prepareLazyVideo(video: HTMLVideoElement) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.pause();
}

function hydrateLazyVideo(video: HTMLVideoElement) {
    if (video.dataset.videoLoaded === 'true') return;

    const sources = Array.from(video.querySelectorAll<HTMLSourceElement>('source[data-src]'));
    let hasSource = false;

    sources.forEach((source) => {
        const pendingSource = source.dataset.src;
        if (!pendingSource) return;

        source.src = pendingSource;
        source.removeAttribute('data-src');
        hasSource = true;
    });

    if (!hasSource) return;

    video.dataset.videoLoaded = 'true';
    video.load();
}

function playLazyVideo(video: HTMLVideoElement) {
    if (document.hidden) return;
    hydrateLazyVideo(video);
    void video.play().catch(() => undefined);
}

function isElementVisible(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
}

function setupOffscreenAnimations() {
    const regions = Array.from(
        document.querySelectorAll<HTMLElement>('.skill-diagram, [data-memo-scene-wall]')
    );
    if (regions.length === 0 || !('IntersectionObserver' in window)) return;

    const visibleRegions = new Set<HTMLElement>();
    const render = () => {
        regions.forEach((region) => {
            region.classList.toggle(
                'is-animation-paused',
                document.hidden || !visibleRegions.has(region)
            );
        });
    };

    regions.forEach((region) => region.classList.add('is-animation-paused'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const region = entry.target as HTMLElement;
            if (entry.isIntersecting) {
                visibleRegions.add(region);
            } else {
                visibleRegions.delete(region);
            }
        });
        render();
    }, { threshold: 0.01 });

    regions.forEach((region) => observer.observe(region));
    document.addEventListener('visibilitychange', render);
}

function setupLazyVideos() {
    const videos = Array.from(
        document.querySelectorAll<HTMLVideoElement>('[data-lazy-video]:not([data-excerpt-demo-video])')
    );
    if (videos.length === 0) return;

    const visibleVideos = new Set<HTMLVideoElement>();
    videos.forEach(prepareLazyVideo);

    const pauseAll = () => videos.forEach((video) => video.pause());
    const resumeVisible = () => visibleVideos.forEach(playLazyVideo);

    if (!('IntersectionObserver' in window)) {
        let animationFrame = 0;
        const updateFallback = () => {
            animationFrame = 0;
            videos.forEach((video) => {
                const rect = video.getBoundingClientRect();
                const isNearViewport = rect.bottom > -600 && rect.top < window.innerHeight + 600;
                const isVisible = isElementVisible(video);

                if (isNearViewport) hydrateLazyVideo(video);
                if (isVisible) {
                    visibleVideos.add(video);
                    playLazyVideo(video);
                } else {
                    visibleVideos.delete(video);
                    video.pause();
                }
            });
        };
        const scheduleFallbackUpdate = () => {
            if (animationFrame) return;
            animationFrame = window.requestAnimationFrame(updateFallback);
        };

        updateFallback();
        window.addEventListener('scroll', scheduleFallbackUpdate, { passive: true });
        window.addEventListener('resize', scheduleFallbackUpdate);
    } else {
        const preloadObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const video = entry.target as HTMLVideoElement;
                hydrateLazyVideo(video);
                observer.unobserve(video);
            });
        }, { rootMargin: '600px 0px', threshold: 0 });

        const playbackObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const video = entry.target as HTMLVideoElement;
                const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.1;

                if (isVisible) {
                    visibleVideos.add(video);
                    playLazyVideo(video);
                    return;
                }

                visibleVideos.delete(video);
                video.pause();
            });
        }, { threshold: [0, 0.1, 0.5] });

        videos.forEach((video) => {
            preloadObserver.observe(video);
            playbackObserver.observe(video);
        });
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pauseAll();
            return;
        }
        resumeVisible();
    });

    window.addEventListener('pagehide', pauseAll);
    window.addEventListener('pageshow', resumeVisible);
}

function setupExcerptDemoPairs() {
    document.querySelectorAll<HTMLElement>('[data-excerpt-demo-pair]').forEach((pair) => {
        const videos = Array.from(pair.querySelectorAll<HTMLVideoElement>('[data-excerpt-demo-video]'));
        if (videos.length !== 2) return;

        const [master, follower] = videos;
        let isVisible = false;
        let isStarting = false;
        let playablePromise: Promise<boolean> | null = null;
        let lastSyncAt = 0;

        videos.forEach(prepareLazyVideo);

        const waitUntilPlayable = (video: HTMLVideoElement) => new Promise<boolean>((resolve) => {
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                resolve(true);
                return;
            }

            const cleanup = () => {
                window.clearTimeout(timeout);
                video.removeEventListener('loadeddata', handleReady);
                video.removeEventListener('canplay', handleReady);
                video.removeEventListener('error', handleError);
            };
            const settle = (ready: boolean) => {
                cleanup();
                resolve(ready);
            };
            const handleReady = () => settle(true);
            const handleError = () => settle(false);
            const timeout = window.setTimeout(() => {
                settle(video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA);
            }, 12000);

            video.addEventListener('loadeddata', handleReady, { once: true });
            video.addEventListener('canplay', handleReady, { once: true });
            video.addEventListener('error', handleError, { once: true });
        });

        const ensurePlayable = () => {
            if (playablePromise) return playablePromise;

            videos.forEach(hydrateLazyVideo);
            playablePromise = Promise.all(videos.map(waitUntilPlayable)).then((results) => {
                const isPlayable = results.every(Boolean);
                if (!isPlayable) playablePromise = null;
                return isPlayable;
            });
            return playablePromise;
        };

        const playTogether = async (restart: boolean) => {
            if (isStarting || !isVisible || document.hidden) return;
            isStarting = true;

            try {
                const isPlayable = await ensurePlayable();
                if (!isPlayable || !isVisible || document.hidden) return;

                videos.forEach((video) => video.pause());
                if (restart) {
                    videos.forEach((video) => {
                        video.currentTime = 0;
                    });
                } else if (Math.abs(master.currentTime - follower.currentTime) > 0.35) {
                    follower.currentTime = master.currentTime;
                }

                videos.forEach((video) => void video.play().catch(() => undefined));
            } finally {
                isStarting = false;
            }
        };

        const keepInSync = () => {
            if (!isVisible || document.hidden || master.paused || follower.paused) return;

            const now = performance.now();
            if (now - lastSyncAt < 1000) return;
            if (Math.abs(master.currentTime - follower.currentTime) <= 0.35) return;

            follower.currentTime = master.currentTime;
            lastSyncAt = now;
        };

        const pauseTogether = () => {
            videos.forEach((video) => video.pause());
        };

        const restartPair = () => void playTogether(true);
        master.addEventListener('ended', restartPair);
        master.addEventListener('timeupdate', keepInSync);

        if (!('IntersectionObserver' in window)) {
            let animationFrame = 0;
            const updateFallback = () => {
                animationFrame = 0;
                const nextVisible = isElementVisible(pair);
                if (nextVisible === isVisible) return;

                isVisible = nextVisible;
                if (isVisible) {
                    void playTogether(master.ended || master.currentTime === 0);
                } else {
                    pauseTogether();
                }
            };
            const scheduleFallbackUpdate = () => {
                if (animationFrame) return;
                animationFrame = window.requestAnimationFrame(updateFallback);
            };

            updateFallback();
            window.addEventListener('scroll', scheduleFallbackUpdate, { passive: true });
            window.addEventListener('resize', scheduleFallbackUpdate);
        } else {
            const preloadObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    void ensurePlayable();
                    observer.unobserve(pair);
                });
            }, { rootMargin: '600px 0px', threshold: 0 });

            const playbackObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const nextVisible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
                    if (nextVisible === isVisible) return;

                    isVisible = nextVisible;
                    if (!nextVisible) {
                        pauseTogether();
                        return;
                    }

                    const shouldRestart = master.ended || master.currentTime >= master.duration - 0.1;
                    void playTogether(shouldRestart);
                });
            }, { threshold: [0, 0.1, 0.5] });

            preloadObserver.observe(pair);
            playbackObserver.observe(pair);
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                pauseTogether();
                return;
            }
            void playTogether(false);
        });

        window.addEventListener('pagehide', pauseTogether);
        window.addEventListener('pageshow', () => void playTogether(false));
    });
}

function setupPortfolioInteractions() {
    setupDiagramZoom();
    setupResumeZoom();
    setupMemoSceneWalls();
    setupOffscreenAnimations();
    setupLazyVideos();
    setupExcerptDemoPairs();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPortfolioInteractions, { once: true });
} else {
    setupPortfolioInteractions();
}
