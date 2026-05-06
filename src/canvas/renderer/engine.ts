import { Matrix3 } from '../core/index.ts';
import { cameraStore, circleStore, guideCircleStore, selectionStore } from '../store/index.ts';
import type { Circle } from '../types/index.ts';
import { initWebGL, setupInstancedBuffers } from '../webgl/index.ts';

// 하이라이트 색상
const CIRCLE_HIGHLIGHT_COLOR = [24 / 255, 160 / 255, 251 / 255];

export const createEngine = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  // WebGL 컨텍스트 및 원 렌더링, UI 렌더링 전용 셰이더 프로그램 초기화
  const { gl, circleProgram, uiProgram } = initWebGL(canvas);

  // ==========================================
  // 원 렌더링(circleProgram) 관련 속성 세팅
  // ==========================================
  const uMatrixLoc = gl.getUniformLocation(circleProgram, 'u_matrix');
  const uZoomLoc = gl.getUniformLocation(circleProgram, 'u_zoom');
  const uDprLoc = gl.getUniformLocation(circleProgram, 'u_dpr');

  // 프래그먼트 셰이더에서 기본 테두리를 숨기기 위해 사용할 호버/선택 객체 정보
  const uHoveredInfoLoc = gl.getUniformLocation(circleProgram, 'u_hovered_info');
  const uSelectedInfoLoc = gl.getUniformLocation(circleProgram, 'u_selected_info');

  // 렌더링 엔진 내부 상태 및 인스턴스 버퍼 구성
  // 한 번에 렌더링 가능한 최대 원의 개수를 제한하여 메모리 확보
  const MAX_CIRCLES = 100000;
  // 단일 원 데이터 구조: x, y, size, r, g, b, a (7개의 float)
  const instanceData = new Float32Array(MAX_CIRCLES * 7);
  const { ext, instanceBuffer } = setupInstancedBuffers(gl, circleProgram, instanceData);

  // ==========================================
  // UI 렌더링(uiProgram) 관련 속성 세팅
  // ==========================================
  const uiBuffer = gl.createBuffer();
  const uUiMatrixLoc = gl.getUniformLocation(uiProgram, 'u_matrix');
  const uUiColorLoc = gl.getUniformLocation(uiProgram, 'u_color');
  const aUiPositionLoc = gl.getAttribLocation(uiProgram, 'a_position');

  // GPU 버퍼 업데이트 최적화를 위한 상태 추적 변수
  let processedCircleCount = 0;
  let isRenderPending = false;

  // 좌표계 변환을 위한 행렬 객체 생성
  let projectionMatrix = Matrix3.create();
  const viewMatrix = Matrix3.create();
  const finalMatrix = Matrix3.create();

  // 브라우저 렌더링 주기에 맞춘 프레임 렌더링 요청 (디바운싱 역할)
  const requestRender = () => {
    if (!isRenderPending) {
      isRenderPending = true;
      requestAnimationFrame(render);
    }
  };

  // 실제 캔버스 화면을 그리는 메인 렌더링 함수
  const render = () => {
    isRenderPending = false;
    if (gl == null || projectionMatrix == null) return;

    // 이전 프레임의 렌더링 결과를 지우고 캔버스 초기화
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 카메라 상태를 기반으로 뷰 변환 행렬 도출
    const { camera } = cameraStore.state;
    Matrix3.translateAndScale(viewMatrix, camera.x, camera.y, camera.scale);

    // 투영 행렬과 뷰 행렬을 곱하여 최종 변환 행렬 완성
    finalMatrix[0] = projectionMatrix[0] * viewMatrix[0];
    finalMatrix[4] = projectionMatrix[4] * viewMatrix[4];
    finalMatrix[6] = projectionMatrix[0] * viewMatrix[6] + projectionMatrix[6];
    finalMatrix[7] = projectionMatrix[4] * viewMatrix[7] + projectionMatrix[7];
    finalMatrix[8] = 1.0;

    // ==========================================
    // 베이스 원 렌더링 페이즈 (인스턴싱 활용)
    // ==========================================
    gl.useProgram(circleProgram);

    gl.uniformMatrix3fv(uMatrixLoc, false, finalMatrix);
    gl.uniform1f(uZoomLoc, camera.scale);
    gl.uniform1f(uDprLoc, window.devicePixelRatio || 1);

    // 현재 상호작용 중인 원의 위치와 크기 정보를 셰이더로 전송
    // 셰이더는 이 정보를 바탕으로 해당 원의 기본 테두리 렌더링을 생략함
    const { hoveredIndex, selectedIndex } = selectionStore.state.selection;
    const circles = circleStore.getCircles();

    if (hoveredIndex !== -1 && hoveredIndex < circles.length) {
      const c = circles[hoveredIndex];
      gl.uniform3f(uHoveredInfoLoc, c.x, c.y, c.size);
    } else {
      // 상호작용 중인 객체가 없을 경우 화면에 존재할 수 없는 좌표 전송
      gl.uniform3f(uHoveredInfoLoc, -999999.0, -999999.0, 0.0);
    }

    if (selectedIndex !== -1 && selectedIndex < circles.length) {
      const c = circles[selectedIndex];
      gl.uniform3f(uSelectedInfoLoc, c.x, c.y, c.size);
    } else {
      gl.uniform3f(uSelectedInfoLoc, -999999.0, -999999.0, 0.0);
    }

    // 스토어에 저장된 실제 원들을 병렬 렌더링
    const count = Math.min(circleStore.getCount(), MAX_CIRCLES);
    if (count > 0) {
      // 이전 프레임에서 가이드 원을 그리느라 덮어씌워진 0번 인덱스 데이터를 원본으로 복구
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceData.subarray(0, 7));
      ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, count);
    }

    // 마우스 상호작용에 따른 가이드 원 렌더링 (인덱스 0번 공간 재활용)
    const { guideCircle } = guideCircleStore.state;
    if (guideCircle.isVisible && guideCircle.circle) {
      const { circle } = guideCircle;
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
      const tempGuideData = new Float32Array([circle.x, circle.y, circle.size, circle.r, circle.g, circle.b, circle.a]);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, tempGuideData);
      ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, 1);
    }

    // ==========================================
    // 하이라이트 UI 렌더링 페이즈 (독립 버퍼 활용)
    // ==========================================
    if (hoveredIndex !== -1 || selectedIndex !== -1) {
      gl.useProgram(uiProgram);
      gl.uniformMatrix3fv(uUiMatrixLoc, false, finalMatrix);

      // 인스턴싱 속성 공간(0번)과의 충돌을 피하기 위해 격리된 5번 공간 버퍼 바인딩
      gl.bindBuffer(gl.ARRAY_BUFFER, uiBuffer);
      gl.enableVertexAttribArray(aUiPositionLoc);
      gl.vertexAttribPointer(aUiPositionLoc, 2, gl.FLOAT, false, 0, 0);

      // 선택 상태에 따른 동적 두께 및 형태를 가진 지오메트리를 생성하여 그리는 내부 함수
      const drawHighlightUI = (
        circle: Circle,
        showSquare: boolean,
        squareAlpha: number,
        squareThickness: number,
        showCircleBorder: boolean,
        circleAlpha: number,
        circleThickness: number
      ) => {
        const r = circle.size / 2;

        // 사각형 바운딩 박스 테두리 생성 (TRIANGLE_STRIP을 이용해 두께를 가진 면으로 구성)
        if (showSquare) {
          // 줌 배율(camera.scale)로 역보정 처리
          // 화면을 줌 인/아웃 하더라도 모니터 픽셀 기준으로는 항상 동일한 두께를 유지하도록 월드 두께 조절
          const tSquare = (squareThickness * (window.devicePixelRatio || 1)) / camera.scale;

          const left = circle.x - r;
          const right = circle.x + r;
          const top = circle.y - r;
          const bottom = circle.y + r;

          const outL = left - tSquare,
            inL = left;
          const outR = right + tSquare,
            inR = right;
          const outT = top - tSquare,
            inT = top;
          const outB = bottom + tSquare,
            inB = bottom;

          const boxVertices = new Float32Array([
            outL,
            outT,
            inL,
            inT,
            outR,
            outT,
            inR,
            inT,
            outR,
            outB,
            inR,
            inB,
            outL,
            outB,
            inL,
            inB,
            outL,
            outT,
            inL,
            inT,
          ]);

          gl.bufferData(gl.ARRAY_BUFFER, boxVertices, gl.DYNAMIC_DRAW);
          gl.uniform4fv(uUiColorLoc, [...CIRCLE_HIGHLIGHT_COLOR, squareAlpha]);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10);
        }

        // 원형 테두리 생성 (지오메트리 분할을 통한 링 형태 구성)
        if (showCircleBorder) {
          // 원의 크기에 비례하여 분할 횟수(segments)를 조정하여 곡선의 부드러움 보장 (최소 64, 최대 512)
          const segments = Math.min(Math.max(64, Math.floor(circle.size * 1.5)), 512);

          // 줌 배율 역보정을 적용한 링의 두께 산출
          const tCircle = (circleThickness * (window.devicePixelRatio || 1)) / camera.scale;
          const circleVertices = new Float32Array((segments + 1) * 4);

          // 안쪽 반지름과 바깥쪽 반지름의 좌표를 지그재그로 배열하여 삼각형 면 구성
          for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);

            circleVertices[i * 4] = circle.x + (r + tCircle) * cosT;
            circleVertices[i * 4 + 1] = circle.y + (r + tCircle) * sinT;

            circleVertices[i * 4 + 2] = circle.x + r * cosT;
            circleVertices[i * 4 + 3] = circle.y + r * sinT;
          }

          gl.bufferData(gl.ARRAY_BUFFER, circleVertices, gl.DYNAMIC_DRAW);
          gl.uniform4fv(uUiColorLoc, [...CIRCLE_HIGHLIGHT_COLOR, circleAlpha]);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, (segments + 1) * 2);
        }
      };

      // 테두리의 시각적 기준이 되는 베이스 두께 정의
      const BASE_THICKNESS = 0.75;

      // 단일 호버 상태: 선택되지 않은 다른 원에 마우스가 올라간 경우
      // 사각형 바운딩 박스를 숨기고 원 테두리만 두껍게 강조
      if (hoveredIndex !== -1 && hoveredIndex !== selectedIndex && hoveredIndex < circles.length) {
        drawHighlightUI(circles[hoveredIndex], false, 0.0, 0.0, true, 1.0, BASE_THICKNESS * 2);
      }

      // 선택 상태: 원이 선택된 상태이며, 해당 원 위로 마우스가 다시 올라갔는지에 따라 두께 스위칭
      // 사각형 바운딩 박스는 항상 기본 두께로 표시
      if (selectedIndex !== -1 && selectedIndex < circles.length) {
        const isHoveringSelected = hoveredIndex === selectedIndex;

        drawHighlightUI(
          circles[selectedIndex],
          true,
          1.0,
          BASE_THICKNESS,
          true,
          1.0,
          isHoveringSelected ? BASE_THICKNESS * 2 : BASE_THICKNESS
        );
      }

      // UI 렌더링 완료 후 사용된 속성 공간 정리
      gl.disableVertexAttribArray(aUiPositionLoc);
    }
  };

  // 스토어의 데이터 변경 사항을 GPU 버퍼에 동기화
  const updateCircleBuffers = () => {
    const circles = circleStore.getCircles();
    const newCount = circles.length;

    // 데이터가 완전히 초기화된 경우 추적 변수 리셋
    if (newCount < processedCircleCount) processedCircleCount = 0;
    if (newCount > MAX_CIRCLES || newCount === processedCircleCount) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);

    // 전체 배열을 덮어씌우지 않고, 새로 추가된 원의 데이터 구간만 부분적으로 GPU에 전송하여 비용 절감
    for (let i = processedCircleCount; i < newCount; i++) {
      const circle = circles[i];
      const offset = i * 7;

      instanceData.set([circle.x, circle.y, circle.size, circle.r, circle.g, circle.b, circle.a], offset);

      const newData = new Float32Array([circle.x, circle.y, circle.size, circle.r, circle.g, circle.b, circle.a]);
      gl.bufferSubData(gl.ARRAY_BUFFER, offset * Float32Array.BYTES_PER_ELEMENT, newData);
    }

    processedCircleCount = newCount;
    requestRender();
  };

  // 브라우저 창 크기 변화에 대응하는 캔버스 리사이즈 처리
  const handleResize = (cssWidth: number, cssHeight: number) => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    projectionMatrix = Matrix3.projection(cssWidth, cssHeight);
    requestRender();
  };

  // 스토어 상태 변경 구독 연결 (카메라, 원, 가이드, 선택 상태)
  const unsubscribeCamera = cameraStore.subscribe('camera', requestRender);
  const unsubscribeCircle = circleStore.subscribe('version', updateCircleBuffers);
  const unsubscribeGuide = guideCircleStore.subscribe('guideCircle', requestRender);
  const unsubscribeSelection = selectionStore.subscribe('selection', requestRender);

  // 캔버스 크기 변화 옵저버 등록
  const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    handleResize(width, height);
  });
  resizeObserver.observe(canvas);

  // 컴포넌트 언마운트 시 메모리 누수를 방지하기 위한 클린업 작업 등록
  cleanupTasks.push(() => {
    resizeObserver.disconnect();
    unsubscribeCamera();
    unsubscribeCircle();
    unsubscribeGuide();
    unsubscribeSelection();
  });

  // 엔진 초기화 시 최초 1회 렌더링 수행
  handleResize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
};
