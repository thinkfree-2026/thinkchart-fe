import { Popover } from '../components/index.ts';
import { createRef } from '../utils/index.ts';

import { worldToScreen } from './core/index.ts';
import { renderCanvas } from './renderer/index.ts';
import { cameraStore, circleStore, selectionStore } from './store/index.ts';
import { setupInteraction } from './tools/index.ts';

export const Canvas = () => {
  const cleanupTasks: Array<() => void> = [];

  const popoverRef = createRef<HTMLDivElement>();

  const updatePopoverPosition = () => {
    if (!popoverRef.current) return;

    const circles = circleStore.getCircles();
    const { selectedIndices } = selectionStore.state.selection;

    if (selectedIndices.length === 1) {
      const { camera } = cameraStore.state;
      const selectedIndex = selectedIndices[0];
      const selectedCircle = circles[selectedIndex];

      if (selectedCircle != null) {
        const screenPos = worldToScreen(selectedCircle.x, selectedCircle.y, camera);
        const screenRadius = selectedCircle.radius * camera.scale;

        popoverRef.current.style.display = 'block';
        popoverRef.current.style.transform = `translate(calc(${screenPos.x}px - 50%), calc(${screenPos.y - screenRadius - 15}px - 100%))`;

        const valueInput = popoverRef.current.querySelector('input[type="number"]') as HTMLInputElement;
        if (valueInput != null) {
          valueInput.value = String(selectedCircle.value);
        }

        const opacityInput = popoverRef.current.querySelector('input[type="range"]') as HTMLInputElement;
        if (opacityInput != null) {
          const currentOpacity = selectedCircle.opacity ?? 1;
          opacityInput.value = String(currentOpacity * 100);

          // // Slider 컴포넌트 Tooltip 위치 업데이트
          // opacityInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    } else {
      popoverRef.current.style.display = 'none';
    }
  };

  const initializeCallback = (canvasElement: HTMLCanvasElement) => {
    renderCanvas(canvasElement, cleanupTasks);
    setupInteraction(canvasElement, cleanupTasks); // 이벤트 매니저 연결

    const unsubscribeCamera = cameraStore.subscribe('camera', updatePopoverPosition);
    const unsubscribeCircle = circleStore.subscribe('version', updatePopoverPosition);
    const unsubscribeSelection = selectionStore.subscribe('selection', updatePopoverPosition);

    cleanupTasks.push(() => {
      unsubscribeCamera();
      unsubscribeCircle();
      unsubscribeSelection();
    });

    updatePopoverPosition();
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

  const handleValueInput = (value: number) => {
    const { selectedIndices } = selectionStore.state.selection;
    if (selectedIndices.length === 1) {
      circleStore.setValue(selectedIndices[0], value);
    }
  };

  const handleOpacityInput = (value: number) => {
    const { selectedIndices } = selectionStore.state.selection;
    if (selectedIndices.length === 1) {
      circleStore.setOpacity(selectedIndices[0], value / 100);
    }
  };

  // const handleDelete = () => {
  //   const { selectedIndices } = selectionStore.state.selection;
  //   if (selectedIndices.length === 1) {
  //     circleStore.deleteCircle(selectedIndices[0]);
  //     selectionStore.setUnselect();
  //   }
  // };

  return (
    <div class="relative h-full w-full overflow-hidden">
      <canvas
        id="canvas"
        class="block h-full w-full cursor-default touch-none bg-[#f0f0f0] bg-[radial-gradient(#333_1px,transparent_1px)] bg-size-[20px_20px]"
        oneffect={(canvasElement: HTMLCanvasElement) => {
          initializeCallback(canvasElement);
          return () => {
            cleanupCallback();
          };
        }}
      />

      <div
        ref={popoverRef}
        class="pointer-events-auto absolute top-0 left-0 hidden origin-bottom transition-transform duration-75"
      >
        <Popover label="이름 없는 원" onValueInput={handleValueInput} onOpacityInput={handleOpacityInput} />
      </div>
    </div>
  );
};
