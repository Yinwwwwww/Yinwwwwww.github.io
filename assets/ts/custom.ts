const DIAGRAM_ZOOM_STEPS = [1, 1.5, 2, 3, 4];

function setupDiagramZoom() {
    document.querySelectorAll<HTMLElement>('.skill-diagram').forEach((diagram) => {
        const viewport = diagram.querySelector<HTMLElement>('.skill-diagram__viewport');
        const svg = viewport?.querySelector<SVGElement>('svg');
        const zoomOut = diagram.querySelector<HTMLButtonElement>('[data-diagram-zoom="out"]');
        const zoomIn = diagram.querySelector<HTMLButtonElement>('[data-diagram-zoom="in"]');
        const zoomLabel = diagram.querySelector<HTMLOutputElement>('.skill-diagram__zoom output');

        if (!viewport || !svg || !zoomOut || !zoomIn || !zoomLabel) return;

        let zoomIndex = 0;

        const renderZoom = (nextIndex: number) => {
            const previousWidth = Math.max(viewport.scrollWidth, 1);
            const centerRatio = (viewport.scrollLeft + viewport.clientWidth / 2) / previousWidth;

            zoomIndex = Math.max(0, Math.min(nextIndex, DIAGRAM_ZOOM_STEPS.length - 1));
            const zoom = DIAGRAM_ZOOM_STEPS[zoomIndex];
            svg.style.width = `${zoom * 100}%`;

            zoomOut.disabled = zoomIndex === 0;
            zoomIn.disabled = zoomIndex === DIAGRAM_ZOOM_STEPS.length - 1;
            zoomLabel.textContent = zoomIndex === 0 ? '适配' : `${Math.round(zoom * 100)}%`;

            requestAnimationFrame(() => {
                if (zoomIndex === 0) {
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
        renderZoom(0);
    });
}

function setupMemoSceneWalls() {
    document.querySelectorAll<HTMLElement>('[data-memo-scene-wall]').forEach((wall) => {
        const panel = wall.querySelector<HTMLElement>('[data-scene-detail-panel]');
        const title = wall.querySelector<HTMLElement>('[data-scene-detail-title]');
        const copy = wall.querySelector<HTMLElement>('[data-scene-detail-copy]');
        const close = wall.querySelector<HTMLButtonElement>('[data-scene-close]');
        const buttons = Array.from(wall.querySelectorAll<HTMLButtonElement>('[data-scene-title]'));

        if (!panel || !title || !copy || !close || buttons.length === 0) return;

        const closeDetail = () => {
            panel.hidden = true;
            wall.classList.remove('is-paused');
            buttons.forEach((button) => {
                button.classList.remove('is-active');
                button.setAttribute('aria-pressed', 'false');
            });
        };

        buttons.forEach((button) => {
            button.setAttribute('aria-pressed', 'false');
            button.addEventListener('click', () => {
                buttons.forEach((item) => {
                    item.classList.toggle('is-active', item === button);
                    item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
                });
                title.textContent = button.dataset.sceneTitle ?? '';
                copy.textContent = button.dataset.sceneDetail ?? '';
                panel.hidden = false;
                wall.classList.add('is-paused');
                close.focus({ preventScroll: true });
            });
        });

        close.addEventListener('click', closeDetail);
        wall.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !panel.hidden) closeDetail();
        });
    });
}

function setupPortfolioInteractions() {
    setupDiagramZoom();
    setupMemoSceneWalls();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPortfolioInteractions, { once: true });
} else {
    setupPortfolioInteractions();
}
