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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDiagramZoom, { once: true });
} else {
    setupDiagramZoom();
}
