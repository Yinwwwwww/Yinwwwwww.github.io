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
            zoomLabel.textContent = zoomIndex === 0 ? '适配' : `${Math.round(zoom * 100)}%`;

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

function setupExcerptDemoPairs() {
    document.querySelectorAll<HTMLElement>('[data-excerpt-demo-pair]').forEach((pair) => {
        const videos = Array.from(pair.querySelectorAll<HTMLVideoElement>('[data-excerpt-demo-video]'));
        if (videos.length !== 2) return;

        const [master, follower] = videos;
        let isRestarting = false;

        videos.forEach((video) => {
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            video.pause();
        });

        const waitUntilPlayable = (video: HTMLVideoElement) => new Promise<void>((resolve) => {
            if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
                resolve();
                return;
            }
            video.addEventListener('canplay', () => resolve(), { once: true });
        });

        const playTogether = async (restart: boolean) => {
            if (isRestarting) return;
            isRestarting = true;

            videos.forEach((video) => video.pause());
            if (restart) {
                videos.forEach((video) => {
                    video.currentTime = 0;
                });
            } else {
                follower.currentTime = master.currentTime;
            }

            await Promise.all(videos.map((video) => video.play().catch(() => undefined)));
            isRestarting = false;
        };

        const keepInSync = () => {
            if (!master.paused && !follower.paused && Math.abs(master.currentTime - follower.currentTime) > 0.1) {
                follower.currentTime = master.currentTime;
            }
        };

        const restartPair = () => void playTogether(true);
        videos.forEach((video) => video.addEventListener('ended', restartPair));
        master.addEventListener('timeupdate', keepInSync);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                videos.forEach((video) => video.pause());
                return;
            }
            void playTogether(true);
        });

        Promise.all(videos.map(waitUntilPlayable)).then(() => {
            void playTogether(true);
        });
    });
}

function setupPortfolioInteractions() {
    setupDiagramZoom();
    setupResumeZoom();
    setupMemoSceneWalls();
    setupExcerptDemoPairs();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPortfolioInteractions, { once: true });
} else {
    setupPortfolioInteractions();
}
