import { CIRCLE_COLOR_HIGHLIGHT } from '../constants/index.ts';
import { cameraStore, circleStore, guideCircleStore, selectionStore } from '../store/index.ts';
import type { Circle } from '../types/index.ts';

const BASE_BORDER_COLOR = '#818CF8';

export const renderCanvas = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D 컨텍스트를 생성할 수 없습니다.');
  }

  let isRenderPending = false;

  // 브라우저 프레임 주기에 맞춘 렌더링 처리
  const requestRender = () => {
    if (!isRenderPending) {
      isRenderPending = true;
      requestAnimationFrame(render);
    }
  };

  // 원 & 기본 테두리 생성 함수
  const drawCircle = (circle: Circle, isHovered: boolean, isSelected: boolean, isGuide: boolean = false) => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);

    ctx.fillStyle = circle.color;
    ctx.fill();

    // 상호작용 중이지 않은 원에만 기본 테두리 생성
    if (!isHovered && !isSelected && !isGuide) {
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = BASE_BORDER_COLOR;
      ctx.stroke();
    }
  };

  // 상호작용 상태에 따른 하이라이트 UI 생성 함수
  const drawHighlight = (
    cameraScale: number,
    circle: Circle,
    showSquare: boolean,
    squareThickness: number,
    showCircleBorder: boolean,
    circleThickness: number
  ) => {
    const size = circle.radius * 2;

    // 사각형 박스 테두리 생성
    if (showSquare) {
      // 모니터 픽셀 기준으로 일정한 두께 유지
      ctx.lineWidth = squareThickness / cameraScale;
      ctx.strokeStyle = CIRCLE_COLOR_HIGHLIGHT;
      ctx.strokeRect(circle.x - circle.radius, circle.y - circle.radius, size, size);
    }

    // 하이라이트 테두리 생성
    if (showCircleBorder) {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      ctx.lineWidth = circleThickness / cameraScale;
      ctx.strokeStyle = CIRCLE_COLOR_HIGHLIGHT;
      ctx.stroke();
    }
  };

  // 메인 렌더링 함수
  const render = () => {
    isRenderPending = false;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const { camera } = cameraStore.state;

    // 이전 프레임 잔상 제거
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 고해상도 대응을 위한 픽셀 스케일링
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // 카메라 이동 및 줌 인/아웃 상태 캔버스 적용
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.scale, camera.scale);

    const circles = circleStore.getCircles();
    const { hoveredIndex, selectedIndex } = selectionStore.state.selection;

    // 원 렌더링
    for (let index = 0; index < circles.length; index++) {
      const circle = circles[index];
      const isHovered = index === hoveredIndex;
      const isSelected = index === selectedIndex;

      drawCircle(circle, isHovered, isSelected);
    }

    // 가이드 원 렌더링
    const { guideCircle } = guideCircleStore.state;
    if (guideCircle.isVisible && guideCircle.circle) {
      drawCircle(guideCircle.circle, false, false, true);
    }

    // 하이라이트 UI 렌더링
    const BASE_THICKNESS = 0.75;

    // 호버 - 선택되지 않은 원에 마우스 호버
    if (hoveredIndex !== -1 && hoveredIndex !== selectedIndex && hoveredIndex < circles.length) {
      drawHighlight(camera.scale, circles[hoveredIndex], false, 0.0, true, BASE_THICKNESS * 2);
    }

    // 선택 - 원이 선택되었으며, 마우스 호버 여부에 따라 테두리 두께 조절
    if (selectedIndex !== -1 && selectedIndex < circles.length) {
      const isHoveringSelected = hoveredIndex === selectedIndex;

      drawHighlight(
        camera.scale,
        circles[selectedIndex],
        true,
        BASE_THICKNESS,
        true,
        isHoveringSelected ? BASE_THICKNESS * 2 : BASE_THICKNESS
      );
    }
  };

  // 브라우저 창 크기 변화 대응 -> 캔버스 픽셀 해상도 다시 생성
  const handleResize = (cssWidth: number, cssHeight: number) => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = cssWidth * devicePixelRatio;
    canvas.height = cssHeight * devicePixelRatio;
    requestRender();
  };

  // 스토어 상태 변경 감지 이벤트 구독 연결
  const unsubscribeCamera = cameraStore.subscribe('camera', requestRender);
  const unsubscribeCircle = circleStore.subscribe('version', requestRender);
  const unsubscribeGuideCircle = guideCircleStore.subscribe('guideCircle', requestRender);
  const unsubscribeSelection = selectionStore.subscribe('selection', requestRender);

  // 캔버스 크기 변화 옵저버 등록
  const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    handleResize(width, height);
  });

  resizeObserver.observe(canvas);

  // 컴포넌트 해제 시 메모리 누수를 막기 위한 클린업 작업 등록
  cleanupTasks.push(() => {
    resizeObserver.disconnect();
    unsubscribeCamera();
    unsubscribeCircle();
    unsubscribeGuideCircle();
    unsubscribeSelection();
  });

  // 초기화 직후 최초 화면을 그리기 위한 리사이즈 이벤트 실행
  const initialWidth = canvas.clientWidth || window.innerWidth;
  const initialHeight = canvas.clientHeight || window.innerHeight;
  handleResize(initialWidth, initialHeight);
};
