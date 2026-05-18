import { api, type ApiResponse } from '../api/http.ts';
import { createRef } from '../utils/index.ts';

import { CIRCLE_RADIUS, CIRCLE_VALUE } from './constants/index.ts';
import { renderCanvas } from './renderer/index.ts';
import { circleStore, selectionStore } from './store/index.ts';
import { setupInteraction } from './tools/index.ts';
import type { Circle } from './types/index.ts';
import type { ChartListItem } from '../types';
import { openChartModal } from '../chart/utils/openChartModal.tsx';

export const Canvas = () => {
  const cleanupTasks: Array<() => void> = [];

  const chartButtonRef = createRef<HTMLButtonElement>(null);

  const renderChartButton = () => {
    if (!chartButtonRef.current) return;

    const { selectedIndices } = selectionStore.state.selection;

    if (selectedIndices.length >= 2) {
      chartButtonRef.current.style.display = 'flex';
    } else {
      chartButtonRef.current.style.display = 'none';
    }
  };

  const handleChartButtonClick = async () => {
    const circles = circleStore.getCircles();
    const { selectedIndices } = selectionStore.state.selection;

    if (selectedIndices.length < 2) return;

    selectedIndices.forEach(selectedIndex => {
      circles[selectedIndex].chartId = '';
    });

    const selectedIds = selectedIndices.map(index => circles[index].id);

    const res: ApiResponse<ChartListItem> = await api.post('/canvas/charts', { circleIds: selectedIds });

    if (!chartButtonRef.current) return;

    selectionStore.setUnselect();
    chartButtonRef.current.style.display = 'none';

    await openChartModal(res.data.id);
  };

  const initializeCallback = async (canvasElement: HTMLCanvasElement) => {
    const res: ApiResponse<Circle[]> = await api.get('/canvas/circles');

    res.data.forEach(circle => {
      circleStore.addCircle({
        ...circle,
        radius: CIRCLE_RADIUS * Math.sqrt(circle.value / CIRCLE_VALUE),
      });
    });

    renderCanvas(canvasElement, cleanupTasks);
    setupInteraction(canvasElement, cleanupTasks); // 이벤트 매니저 연결

    const unsubscribeSelection = selectionStore.subscribe('selection', renderChartButton);

    cleanupTasks.push(() => {
      unsubscribeSelection();
    });

    renderChartButton();
  };

  const cleanupCallback = () => {
    cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Canvas cleanup task failed:', error);
      }
    });
    cleanupTasks.length = 0;
  };

  return (
    <div class="relative h-full w-full overflow-hidden">
      <canvas
        id="canvas"
        class="block h-full w-full cursor-[url('/cursor-black.png'),auto] touch-none bg-[#f0f0f0] bg-[radial-gradient(#333_1px,transparent_1px)] bg-size-[20px_20px]"
        oneffect={(canvasElement: HTMLCanvasElement) => {
          initializeCallback(canvasElement).catch(error => {
            console.error(error);
          });
          return () => {
            cleanupCallback();
          };
        }}
      />
      <button
        ref={chartButtonRef}
        onClick={handleChartButtonClick}
        class="absolute bottom-4 left-1/2 hidden -translate-x-1/2 transform cursor-pointer items-center justify-center rounded-lg bg-[#FF007A] px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:opacity-75"
      >
        차트 생성
      </button>
    </div>
  );
};
