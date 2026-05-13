import { brushStore, cameraStore, circleStore, cursorStore, guideCircleStore, selectionStore } from '../store/index.ts';

import { drawBrush } from './brushRenderer.ts';
import { drawCircle } from './circleRenderer.ts';
import { drawCursor } from './cursorRenderer.ts';
import { drawHighlight } from './highlightRenderer.ts';

// 캔버스 렌더링 파이프라인 통제 및 하위 렌더러 조율
export const renderCanvas = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D 컨텍스트 생성 불가');
  }

  let isRenderPending = false;

  // 브라우저 렌더링 주기에 맞춰 드로우 콜을 묶어서 처리하는 디바운싱 로직
  const requestRender = () => {
    if (!isRenderPending) {
      isRenderPending = true;
      requestAnimationFrame(render);
    }
  };

  // 실제 화면을 비우고 하위 렌더러들에게 그리기 명령을 전달하는 메인 렌더링 함수
  const render = () => {
    isRenderPending = false;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const { camera } = cameraStore.state;

    // 이전 프레임의 잔상을 화면에서 완전히 제거
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 고해상도 디스플레이 대응을 위해 픽셀 밀도를 캔버스 스케일에 적용
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // 카메라의 이동 좌표 및 줌 배율을 캔버스 전체 영역에 반영
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.scale, camera.scale);

    const circles = circleStore.getCircles();
    const { hoveredIndex, selectedIndices } = selectionStore.state.selection;

    // 스토어에 저장된 실제 원 데이터를 순회하며 렌더링 진행
    circles.forEach((circle, index) => {
      const isHovered = index === hoveredIndex;
      const isSelected = selectedIndices.includes(index);

      drawCircle(ctx, circle, isHovered, isSelected);
    });

    const { brush } = brushStore.state;
    if (brush.isVisible && brush.points.length > 0) {
      drawBrush(ctx, camera.scale, brush.points);
    }

    // 마우스를 따라다니는 가이드 원이 활성화된 상태일 경우 화면에 렌더링
    const { guideCircle } = guideCircleStore.state;
    if (guideCircle.isVisible && guideCircle.circle) {
      drawCircle(ctx, guideCircle.circle, false, false, true);
    }

    const BASE_THICKNESS = 0.75;

    // 호버 상태 처리
    if (hoveredIndex !== -1 && !selectedIndices.includes(hoveredIndex) && hoveredIndex < circles.length) {
      drawHighlight(ctx, camera.scale, circles[hoveredIndex], false, 0.0, true, BASE_THICKNESS * 2);
    }

    // 선택 상태 처리
    if (selectedIndices.length > 0) {
      selectedIndices.forEach(index => {
        if (index < circles.length) {
          const isHoveringSelected = hoveredIndex === index;

          drawHighlight(
            ctx,
            camera.scale,
            circles[index],
            true,
            BASE_THICKNESS,
            true,
            isHoveringSelected ? BASE_THICKNESS * 2 : BASE_THICKNESS
          );
        }
      });
    }

    // 커서
    const cursor = cursorStore.state.cursor;
    if (cursor) {
      // console.log(cursor);
      drawCursor(ctx, cursor);
    }
  };

  // 브라우저 창 크기가 변할 때 캔버스 해상도 재설정
  const handleResize = (cssWidth: number, cssHeight: number) => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = cssWidth * devicePixelRatio;
    canvas.height = cssHeight * devicePixelRatio;
    requestRender();
  };

  // 데이터 스토어의 상태 변경 이벤트를 구독하여 화면 갱신 요청
  const unsubscribeCamera = cameraStore.subscribe('camera', requestRender);
  const unsubscribeCircle = circleStore.subscribe('version', requestRender);
  const unsubscribeGuideCircle = guideCircleStore.subscribe('guideCircle', requestRender);
  const unsubscribeSelection = selectionStore.subscribe('selection', requestRender);
  const unsubscribeBrush = brushStore.subscribe('brush', requestRender);
  const unsubscribeCursor = cursorStore.subscribe('cursor', requestRender);

  // 캔버스 HTML 요소의 크기 변화를 감지하는 옵저버 등록
  const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    handleResize(width, height);
  });

  resizeObserver.observe(canvas);

  // 컴포넌트 마운트 해제 시 메모리 누수를 막기 위한 이벤트 구독 및 옵저버 해제 작업을 배열에 추가
  cleanupTasks.push(() => {
    resizeObserver.disconnect();
    unsubscribeCamera();
    unsubscribeCircle();
    unsubscribeGuideCircle();
    unsubscribeSelection();
    unsubscribeBrush();
    unsubscribeCursor();
  });

  // 컨트롤러 초기화 직후 화면을 꽉 채우기 위해 리사이즈 이벤트 강제 실행
  const initialWidth = canvas.clientWidth || window.innerWidth;
  const initialHeight = canvas.clientHeight || window.innerHeight;
  handleResize(initialWidth, initialHeight);
};
