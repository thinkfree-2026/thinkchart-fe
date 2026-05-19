import { chartListState, subscribe as chartListSubscribe } from '../../store/index.ts';
import {
  brushStore,
  cameraStore,
  circleStore,
  cursorStore,
  guideCircleStore,
  selectionStore,
  userStore,
} from '../store/index.ts';
import type { Circle } from '../types/index.ts';

import { drawBrush } from './brushRenderer.ts';
import { drawCircle } from './circleRenderer.ts';
import { drawConnection } from './connectionRenderer.ts';
import { drawCursor } from './cursorRenderer.ts';
import { drawHighlight } from './highlightRenderer.ts';

// 캔버스 렌더링 파이프라인 및 하위 렌더러 제어
export const renderCanvas = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D 컨텍스트 생성 불가');
  }

  let isRenderPending = false;

  const requestRender = () => {
    if (!isRenderPending) {
      isRenderPending = true;
      requestAnimationFrame(render);
    }
  };

  const render = () => {
    isRenderPending = false;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const { camera } = cameraStore.state;

    // 이전 프레임 잔상 제거
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 고해상도 디스플레이 대응 - 픽셀 밀도를 캔버스 스케일에 적용
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // 카메라의 이동 & 줌 인/아웃
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.scale, camera.scale);

    const circles = circleStore.getCircles();
    const { hoveredIndex, selectedIndices } = selectionStore.state.selection;

    // 원 연결 선 렌더링
    const hoveredChartId = chartListState.hoveredChartId;

    if (hoveredChartId !== null) {
      const chartsMap = new Map<string, Circle[]>();

      circles.forEach(circle => {
        if (circle.chartId === hoveredChartId) {
          const charts = chartsMap.get(circle.chartId);

          if (charts) {
            charts.push(circle);
          } else {
            chartsMap.set(circle.chartId, [circle]);
          }
        }
      });

      if (chartsMap.size > 0) {
        drawConnection(ctx, chartsMap);
      }
    }

    // 원 렌더링
    circles.forEach((circle, index) => {
      const isHovered = index === hoveredIndex;
      const isSelected = selectedIndices.includes(index);

      drawCircle(ctx, circle, isHovered, isSelected);
    });

    // 브러시 렌더링
    const { brush } = brushStore.state;
    if (brush.isVisible && brush.points.length > 0) {
      drawBrush(ctx, camera.scale, brush.points);
    }

    // 가이드 원 렌더링
    const { guideCircle } = guideCircleStore.state;
    if (guideCircle.isVisible && guideCircle.circle) {
      drawCircle(ctx, guideCircle.circle, false, false, true);
    }

    const BASE_THICKNESS = 0.75;

    // 호버 표시 렌더링
    if (hoveredIndex !== -1 && !selectedIndices.includes(hoveredIndex) && hoveredIndex < circles.length) {
      drawHighlight(ctx, camera.scale, circles[hoveredIndex], false, 0.0, true, BASE_THICKNESS * 2);
    }

    // 선택 표시 렌더링
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

    // 커서 렌더링
    const { userId } = userStore.state;
    const cursors = cursorStore.getCursors();
    cursors.forEach(cursor => {
      if (cursor.id !== userId) {
        drawCursor(ctx, cursor);
      }
    });
  };

  // 브라우저 창 크기가 변할 때 캔버스 해상도 재설정
  const handleResize = (cssWidth: number, cssHeight: number) => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = cssWidth * devicePixelRatio;
    canvas.height = cssHeight * devicePixelRatio;
    requestRender();
  };

  // 스토어 구독 - 리렌더링
  const unsubscribeCamera = cameraStore.subscribe('camera', requestRender);
  const unsubscribeCircle = circleStore.subscribe('version', requestRender);
  const unsubscribeGuideCircle = guideCircleStore.subscribe('guideCircle', requestRender);
  const unsubscribeSelection = selectionStore.subscribe('selection', requestRender);
  const unsubscribeBrush = brushStore.subscribe('brush', requestRender);
  const unsubscribeCursor = cursorStore.subscribe('cursors', requestRender);
  const unsubscribeChartList = chartListSubscribe('hoveredChartId', requestRender);

  const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    handleResize(width, height);
  });

  resizeObserver.observe(canvas);

  // 스토어 구독 및 옵저버 해제
  cleanupTasks.push(() => {
    resizeObserver.disconnect();
    unsubscribeCamera();
    unsubscribeCircle();
    unsubscribeGuideCircle();
    unsubscribeSelection();
    unsubscribeBrush();
    unsubscribeCursor();
    unsubscribeChartList();
  });

  // 컨트롤러 초기화 직후 화면을 꽉 채우기 위한 리사이즈 이벤트 실행
  const initialWidth = canvas.clientWidth || window.innerWidth;
  const initialHeight = canvas.clientHeight || window.innerHeight;
  handleResize(initialWidth, initialHeight);
};
