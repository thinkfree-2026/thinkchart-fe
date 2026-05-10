import { CIRCLE_COLOR, CIRCLE_RADIUS, GUIDE_CIRCLE_COLOR } from '../constants/index.ts';
import { screenToWorld } from '../core/index.ts';
import { cameraStore, circleStore, guideCircleStore, selectionStore } from '../store/index.ts';

import { getHoveredCircleIndex } from './collision.ts';
import { createPulseAnimation } from './pulseAnimation.ts';

// 사용자 입력 처리 및 캔버스 컴포넌트 제어
export const setupInteraction = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  let isSpacePressed = false;
  let isCameraDragging = false;
  let isCircleDragging = false;
  let isRightClickDragging = false;
  let autoCameraPanningId: number | null = null;
  let hasMovedDuringClick = false; // 원 선택 후 이동 여부

  const currentMousePosition = { x: 0, y: 0 };

  // 원 생성 시 펄스 애니메이션 초기화
  const pulseAnimation = createPulseAnimation(
    currentCount => {
      guideCircleStore.setRadius(CIRCLE_RADIUS * currentCount);
    },
    (pulseSize, currentCount) => {
      const { camera } = cameraStore.state;
      const worldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);

      guideCircleStore.set({
        x: worldPosition.x,
        y: worldPosition.y,
        radius: CIRCLE_RADIUS * currentCount + pulseSize,
        color: GUIDE_CIRCLE_COLOR,
      });
    }
  );

  // 이동중인 원의 테두리가 화면 끝에 도달할 경우 카메라를 이동시키는 로직
  const updateAutoCameraPanning = () => {
    if (!isCircleDragging) return;

    const { selectedIndices } = selectionStore.state.selection;

    if (selectedIndices.length === 0) {
      stopAutoCameraPanning();
      return;
    }

    const circles = circleStore.getCircles();
    const { camera } = cameraStore.state;

    let minScreenX = Infinity;
    let maxScreenX = -Infinity;
    let minScreenY = Infinity;
    let maxScreenY = -Infinity;

    selectedIndices.forEach(selectedIndex => {
      const targetCircle = circles[selectedIndex];
      // 월드 좌표 기반의 원 위치를 현재 카메라 배율이 반영된 화면 픽셀 좌표로 변환
      const screenX = targetCircle.x * camera.scale + camera.x;
      const screenY = targetCircle.y * camera.scale + camera.y;
      const screenRadius = targetCircle.radius * camera.scale;

      minScreenX = Math.min(minScreenX, screenX - screenRadius);
      maxScreenX = Math.max(maxScreenX, screenX + screenRadius);
      minScreenY = Math.min(minScreenY, screenY - screenRadius);
      maxScreenY = Math.max(maxScreenY, screenY + screenRadius);
    });

    let panSpeedX = 0;
    let panSpeedY = 0;
    const PAN_SPEED = 8; // 매 프레임당 이동할 기준 픽셀 속도

    // 좌우 경계 도달 확인 및 이동 방향 결정
    if (minScreenX <= 0) {
      panSpeedX = PAN_SPEED;
    }
    if (maxScreenX >= canvas.clientWidth) {
      panSpeedX = -PAN_SPEED;
    }
    // 상하 경계 도달 확인 및 이동 방향 결정
    if (minScreenY <= 0) {
      panSpeedY = PAN_SPEED;
    }
    if (maxScreenY >= canvas.clientHeight) {
      panSpeedY = -PAN_SPEED;
    }

    // 경계에 닿아 이동 속도가 발생한 경우 카메라 및 원 좌표 갱신
    if (panSpeedX !== 0 || panSpeedY !== 0) {
      cameraStore.pan(panSpeedX, panSpeedY);

      // 다중 원 이동
      selectedIndices.forEach(selectedIndex => {
        const targetCircle = circles[selectedIndex];
        circleStore.updateCirclePosition(
          selectedIndex,
          targetCircle.x - panSpeedX / camera.scale,
          targetCircle.y - panSpeedY / camera.scale
        );
      });

      updateGuideCircleState();
    }

    // 마우스를 뗄 때까지 프레임마다 검사
    autoCameraPanningId = requestAnimationFrame(updateAutoCameraPanning);
  };

  // 자동 카메라 이동 시작
  const startAutoCameraPanning = () => {
    if (autoCameraPanningId === null) {
      autoCameraPanningId = requestAnimationFrame(updateAutoCameraPanning);
    }
  };

  // 자동 카메라 이동 정지
  const stopAutoCameraPanning = () => {
    if (autoCameraPanningId !== null) {
      cancelAnimationFrame(autoCameraPanningId);
      autoCameraPanningId = null;
    }
  };

  // 가이드 원의 상태 및 가시성 실시간 업데이트
  const updateGuideCircleState = () => {
    const { camera } = cameraStore.state;
    const worldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);
    const hoveredIndex = getHoveredCircleIndex(worldPosition.x, worldPosition.y);

    selectionStore.setHover(hoveredIndex);

    const isOverCircle = hoveredIndex !== -1;
    const shouldShowGuide = !isCameraDragging && !isCircleDragging && !isRightClickDragging && !isOverCircle;

    if (!pulseAnimation.isCharging) {
      if (!shouldShowGuide) {
        guideCircleStore.hide();
        return;
      }

      guideCircleStore.set({
        x: worldPosition.x,
        y: worldPosition.y,
        radius: CIRCLE_RADIUS * pulseAnimation.currentCount,
        color: GUIDE_CIRCLE_COLOR,
      });
    }

    guideCircleStore.show();
  };

  // 키보드 입력에 따라 액션 제어
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed = true;
      canvas.style.cursor = 'grabbing';
    }

    // 백스페이스 키 입력 시 선택된 원 삭제
    if (e.code === 'Backspace') {
      const { selectedIndices } = selectionStore.state.selection;

      if (selectedIndices.length > 0) {
        e.preventDefault();

        // 삭제 시 인덱스 밀림 방지를 위한 내림차순 정렬
        const sortedIndices = [...selectedIndices].sort((a, b) => b - a);
        sortedIndices.forEach(index => circleStore.deleteCircle(index));

        selectionStore.setUnselect();
        updateGuideCircleState();
      }
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed = false;
      canvas.style.cursor = 'default';
    }
  };

  // 마우스 클릭 시 선택, 드래그 시작 또는 생성 애니메이션 실행
  const onPointerDown = (e: PointerEvent) => {
    currentMousePosition.x = e.clientX;
    currentMousePosition.y = e.clientY;

    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      isCameraDragging = true;
      canvas.style.cursor = 'default';
      updateGuideCircleState();
      return;
    }

    // 좌클릭
    if (e.button === 0) {
      // 클릭한 순간에는 이동 X
      hasMovedDuringClick = false;

      const { camera } = cameraStore.state;
      const worldPosition = screenToWorld(e.clientX, e.clientY, camera);
      const hoveredIndex = getHoveredCircleIndex(worldPosition.x, worldPosition.y);

      const { selectedIndices } = selectionStore.state.selection;

      // 캔버스 빈 공간 클릭
      if (hoveredIndex === -1) {
        selectionStore.setUnselect();
        pulseAnimation.start();
        return;
      }

      // Ctrl +좌클릭 시 선택된 원에 추가 및 삭제
      if (e.ctrlKey) {
        if (!selectedIndices.includes(hoveredIndex)) {
          selectionStore.addSelect(hoveredIndex);
        } else {
          selectionStore.deleteSelect(hoveredIndex);
        }
        return;
      }

      if (!selectedIndices.includes(hoveredIndex)) {
        selectionStore.setSelect(hoveredIndex);
      }

      isCircleDragging = true;
      startAutoCameraPanning();
      return;
    }

    // 우클릭
    if (e.button === 2) {
      guideCircleStore.hide();
      // 선택되어 있는 원 해제
      selectionStore.setUnselect();

      const { camera } = cameraStore.state;
      const worldPosition = screenToWorld(e.clientX, e.clientY, camera);
      const hoveredIndex = getHoveredCircleIndex(worldPosition.x, worldPosition.y);

      isRightClickDragging = true;
      selectionStore.addSelect(hoveredIndex);
      return;
    }
  };

  // 마우스 이동 시 카메라 & 원 위치 이동
  const onPointerMove = (e: PointerEvent) => {
    const { camera } = cameraStore.state;

    const previousWorldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);
    const currentWorldPosition = screenToWorld(e.clientX, e.clientY, camera);
    const deltaWorldX = currentWorldPosition.x - previousWorldPosition.x;
    const deltaWorldY = currentWorldPosition.y - previousWorldPosition.y;

    currentMousePosition.x = e.clientX;
    currentMousePosition.y = e.clientY;

    if (isCameraDragging) {
      cameraStore.pan(e.movementX, e.movementY);
    }

    if (isCircleDragging) {
      // 클릭 후 드래그 발생
      hasMovedDuringClick = true;

      const { selectedIndices } = selectionStore.state.selection;

      if (selectedIndices.length > 0) {
        const circles = circleStore.getCircles();

        // 선택된 모든 원 좌표 갱신
        selectedIndices.forEach(index => {
          const targetCircle = circles[index];
          circleStore.updateCirclePosition(index, targetCircle.x + deltaWorldX, targetCircle.y + deltaWorldY);
        });
      }
    }

    if (isRightClickDragging) {
      // 우클릭 드래그 시 지나가는 원들을 연속으로 배열에 추가
      const hoveredIndex = getHoveredCircleIndex(currentWorldPosition.x, currentWorldPosition.y);
      selectionStore.addSelect(hoveredIndex);
    }

    updateGuideCircleState();
  };

  // 클릭 해제 시 모든 드래그 상태 & 원 생성
  const onPointerUp = (e: PointerEvent) => {
    if (isCameraDragging) {
      isCameraDragging = false;
      canvas.style.cursor = isSpacePressed ? 'grabbing' : 'default';
      stopAutoCameraPanning();
      updateGuideCircleState();
      return;
    }

    if (isCircleDragging) {
      isCircleDragging = false;
      stopAutoCameraPanning();

      // 좌클릭으로 제자리에서 눌렀다 뗀 경우
      if (e.button === 0 && !hasMovedDuringClick) {
        const { camera } = cameraStore.state;
        const worldPosition = screenToWorld(e.clientX, e.clientY, camera);
        const hoveredIndex = getHoveredCircleIndex(worldPosition.x, worldPosition.y);

        // 클릭한 원이 선택된 원 배열 안에 있으면 단일 선택으로 전환
        if (hoveredIndex !== -1) {
          selectionStore.setSelect(hoveredIndex);
        }
      }

      updateGuideCircleState();
      return;
    }

    if (isRightClickDragging) {
      isRightClickDragging = false;
      updateGuideCircleState();
      return;
    }

    if (!pulseAnimation.isCharging) return;

    // 좌클릭
    if (e.button === 0) {
      const finalCount = pulseAnimation.stop();
      const { camera } = cameraStore.state;
      const worldPosition = screenToWorld(currentMousePosition.x, currentMousePosition.y, camera);

      circleStore.addCircle({
        x: worldPosition.x,
        y: worldPosition.y,
        radius: CIRCLE_RADIUS * finalCount,
        color: CIRCLE_COLOR,
      });

      const newCircleIndex = circleStore.getCircles().length - 1;
      selectionStore.setSelect(newCircleIndex);

      guideCircleStore.setRadius(CIRCLE_RADIUS);
      updateGuideCircleState();
    }
  };

  const onPointerLeave = () => {
    if (!isCircleDragging) {
      guideCircleStore.hide();
      selectionStore.setHover(-1);
      pulseAnimation.cancel();
      stopAutoCameraPanning();
    }
    isRightClickDragging = false;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    currentMousePosition.x = e.clientX;
    currentMousePosition.y = e.clientY;

    if (e.ctrlKey) {
      const zoomIntensity = 0.002;
      const zoomFactor = Math.exp(e.deltaY * -zoomIntensity);
      cameraStore.zoom(zoomFactor, e.clientX, e.clientY);
    } else {
      cameraStore.pan(-e.deltaX, -e.deltaY);
    }

    updateGuideCircleState();
  };

  // 우클릭 기본 이벤트 호출 방지
  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('contextmenu', onContextMenu);

  cleanupTasks.push(() => {
    pulseAnimation.cancel();
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('contextmenu', onContextMenu);
  });
};
