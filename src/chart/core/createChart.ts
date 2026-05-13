import { CHART_SIZES } from '../constants/constants.ts';
import { drawChart } from '../draw/drawChart.ts';
import { hitTestBar } from '../interaction/hitTest.ts';
import type { ChartData, PopoverInfo } from '../types/types.ts';
import { getBarTopY, getBarX, getLogicalCoordinates, isExcessive } from '../utils/index.ts';

type CreateChartOptions = {
  subscribeAxisRedraw?: (redraw: () => void) => () => void;
  subscribeDataRedraw?: (redraw: () => void) => () => void;
  subscribeViewportRedraw?: (redraw: () => void) => () => void;
};

export const createChart = (
  canvas: HTMLCanvasElement,
  data: ChartData[],
  onBarClick?: (info: PopoverInfo | null) => void,
  chartOptions?: CreateChartOptions
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { redraw: () => {}, destroy: () => {} };

  let isDragging = false;
  let draggedBarIndex: number | null = null;
  let dragReleaseTimer: number | null = null;
  let dragStartY = 0;
  let initialBarValue = 0;
  let lastCalculatedChartHeight = 0;
  let lastCalculatedSpacing = 0;
  let lastCalculatedOriginX = 0;

  const initialMax = Math.max(...data.map(d => d.value));
  const fixedYMax = initialMax > 0 ? initialMax * 1.2 : 100;

  const cleanupTasks: Array<() => void> = [];

  const requestRedraw = () => {
    const rect = canvas.getBoundingClientRect();
    requestAnimationFrame(() => {
      const result = drawChart({
        ctx,
        width: rect.width,
        height: rect.height,
        data,
        max: fixedYMax,
      });

      if (result) {
        lastCalculatedChartHeight = result.chartHeight;
        lastCalculatedSpacing = result.gap;
        lastCalculatedOriginX = result.originX ?? 0;
      }
    });
  };

  const onPointerDown = (e: MouseEvent) => {
    const { x, y } = getLogicalCoordinates(e, canvas);

    let hitIndex = -1;
    let hitResult = null;

    for (let i = 0; i < data.length; i++) {
      const result = hitTestBar({
        x,
        y,
        index: i,
        item: data[i],
        spacing: lastCalculatedSpacing,
        chartHeight: lastCalculatedChartHeight,
        max: fixedYMax,
        originX: lastCalculatedOriginX,
      });

      if (result.hit) {
        hitIndex = i;
        hitResult = result;
        break;
      }
    }

    if (hitIndex !== -1 && hitResult) {
      const item = data[hitIndex];

      // active 처리
      data.forEach((d, idx) => (d.isActive = idx === hitIndex));

      // 드래그 시작
      if (hitResult.isTop) {
        isDragging = true;
        draggedBarIndex = hitIndex;
        dragStartY = y;
        initialBarValue = item.value;
        document.body.dataset.chartDragging = 'true';
        document.body.style.cursor = 'ns-resize';
      }

      // 콜백
      onBarClick?.({
        x: hitResult.barX + CHART_SIZES.BAR_WIDTH / 2,
        y: hitResult.barTopY,
        value: item.value,
        name: item.name,
        index: hitIndex,
        opacity: item.opacity ?? 100,
      });

      requestRedraw();
      e.preventDefault();
      return;
    }

    // 아무것도 안 맞음
    data.forEach(d => (d.isActive = false));
    onBarClick?.(null);
    requestRedraw();
  };

  const onPointerMove = (e: MouseEvent) => {
    const { x, y } = getLogicalCoordinates(e, canvas);

    if (!isDragging) {
      let hoverTop = false;

      for (let i = 0; i < data.length; i++) {
        const item = data[i];

        const barX = getBarX(i, lastCalculatedSpacing, lastCalculatedOriginX);

        const barTopY = isExcessive(item.value, fixedYMax)
          ? CHART_SIZES.PADDING_TOP
          : getBarTopY(item.value, fixedYMax, lastCalculatedChartHeight);

        if (x >= barX && x <= barX + CHART_SIZES.BAR_WIDTH && Math.abs(y - barTopY) < CHART_SIZES.HIT_TOLERANCE) {
          hoverTop = true;
          break;
        }
      }

      canvas.style.cursor = hoverTop ? 'ns-resize' : 'default';

      return;
    }

    if (draggedBarIndex !== null) {
      const deltaY = dragStartY - y;
      const valuePerPixel = fixedYMax / lastCalculatedChartHeight;

      const newValue = initialBarValue + deltaY * valuePerPixel;

      data[draggedBarIndex].value = Math.max(0, Math.round(newValue));

      requestRedraw();
      const draggedItem = data[draggedBarIndex];
      const barX = getBarX(draggedBarIndex, lastCalculatedSpacing, lastCalculatedOriginX);
      const barTopY = isExcessive(draggedItem.value, fixedYMax)
        ? CHART_SIZES.PADDING_TOP
        : getBarTopY(draggedItem.value, fixedYMax, lastCalculatedChartHeight);
      onBarClick?.({
        x: barX + CHART_SIZES.BAR_WIDTH / 2,
        y: barTopY,
        value: draggedItem.value,
        name: draggedItem.name,
        index: draggedBarIndex,
        opacity: draggedItem.opacity ?? 100,
      });
      e.preventDefault();
    }
  };

  const onPointerUp = () => {
    if (isDragging) {
      isDragging = false;
      draggedBarIndex = null;
      if (dragReleaseTimer !== null) {
        window.clearTimeout(dragReleaseTimer);
      }
      // mouseup 뒤 이어지는 backdrop click에서 모달이 닫히지 않도록 한 틱 지연 해제
      dragReleaseTimer = window.setTimeout(() => {
        delete document.body.dataset.chartDragging;
        dragReleaseTimer = null;
      }, 0);
      document.body.style.cursor = '';
      canvas.style.cursor = 'default';
    }
  };

  canvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  cleanupTasks.push(() => {
    canvas.removeEventListener('mousedown', onPointerDown);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('mouseup', onPointerUp);
    if (dragReleaseTimer !== null) {
      window.clearTimeout(dragReleaseTimer);
      dragReleaseTimer = null;
    }
    delete document.body.dataset.chartDragging;
    document.body.style.cursor = '';
  });

  if (chartOptions?.subscribeAxisRedraw) {
    cleanupTasks.push(chartOptions.subscribeAxisRedraw(requestRedraw));
  }
  if (chartOptions?.subscribeDataRedraw) {
    cleanupTasks.push(chartOptions.subscribeDataRedraw(requestRedraw));
  }
  if (chartOptions?.subscribeViewportRedraw) {
    cleanupTasks.push(chartOptions.subscribeViewportRedraw(requestRedraw));
  }

  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      if (width && height) {
        requestAnimationFrame(() => {
          const result = drawChart({
            ctx,
            width: width,
            height: height,
            data,
            max: fixedYMax,
          });

          if (result) {
            lastCalculatedChartHeight = result.chartHeight;
            lastCalculatedSpacing = result.gap;
            lastCalculatedOriginX = result.originX ?? 0;
          }
        });
      }
    }
  });

  resizeObserver.observe(canvas);
  cleanupTasks.push(() => resizeObserver.disconnect());

  return {
    redraw: requestRedraw,
    destroy: () => {
      cleanupTasks.forEach(fn => fn());
    },
  };
};
