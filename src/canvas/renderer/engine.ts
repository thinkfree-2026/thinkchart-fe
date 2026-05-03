import { Matrix3 } from '../core/index.ts';
import { cameraStore, circleStore, guideCircleStore, MAX_CIRCLES } from '../store/index.ts';
import { initWebGL, setupInstancedBuffers } from '../webgl/index.ts';

export const createEngine = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  // WebGL 컨텍스트 및 프로그램 초기화
  const { gl, program } = initWebGL(canvas);

  const uMatrixLoc = gl.getUniformLocation(program, 'u_matrix');
  const uZoomLoc = gl.getUniformLocation(program, 'u_zoom');
  const uDprLoc = gl.getUniformLocation(program, 'u_dpr');

  // 엔진 내부 상태 (State & Buffers)
  const instanceData = new Float32Array(MAX_CIRCLES * 7); // x, y, size, r, g, b, a
  const { ext, instanceBuffer } = setupInstancedBuffers(gl, program, instanceData);

  let processedCircleCount = 0; // GPU에 전송 완료된 원의 개수
  let isRenderPending = false; // 중복 렌더링 방지 플래그

  // 행렬 생성
  let projectionMatrix = Matrix3.create();
  const viewMatrix = Matrix3.create();
  const finalMatrix = Matrix3.create();

  // 프레임 최적화 렌더링
  const requestRender = () => {
    if (!isRenderPending) {
      isRenderPending = true;
      requestAnimationFrame(render);
    }
  };

  // 캔버스 렌더링
  const render = () => {
    isRenderPending = false;
    if (gl == null || projectionMatrix == null) return;

    // 캔버스 비우기
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    // 카메라 행렬 생성
    const { camera } = cameraStore.state;
    Matrix3.translateAndScale(viewMatrix, camera.x, camera.y, camera.scale);

    finalMatrix[0] = projectionMatrix[0] * viewMatrix[0];
    finalMatrix[4] = projectionMatrix[4] * viewMatrix[4];
    finalMatrix[6] = projectionMatrix[0] * viewMatrix[6] + projectionMatrix[6];
    finalMatrix[7] = projectionMatrix[4] * viewMatrix[7] + projectionMatrix[7];
    finalMatrix[8] = 1.0;

    // GPU로 유니폼 변수 전송
    gl.uniformMatrix3fv(uMatrixLoc, false, finalMatrix);
    gl.uniform1f(uZoomLoc, camera.scale);
    gl.uniform1f(uDprLoc, window.devicePixelRatio || 1);

    // 인스턴싱 드로우
    const count = circleStore.getCount();
    if (count > 0) {
      ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, count);
    }

    // 가이드 원 드로우
    const { guideCircle } = guideCircleStore.state;
    if (guideCircle.isVisible) {
      // 임시로 데이터 배열의 첫 번째 슬롯에 가이드 데이터 채웁니다.
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);

      const guideCircleData = new Float32Array([
        guideCircle.x,
        guideCircle.y,
        100,
        99 / 255,
        102 / 255,
        241 / 255,
        0.8,
      ]);

      gl.bufferSubData(gl.ARRAY_BUFFER, 0, guideCircleData);

      // 인스턴스 1개만 드로우
      ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, 1);
    }
  };

  // 버퍼 업데이트
  const updateCircleBuffers = () => {
    const { circles } = circleStore.state;
    const newCount = circles.length;

    // 데이터가 초기화되었을 경우 추적 초기화
    if (newCount < processedCircleCount) processedCircleCount = 0;
    if (newCount > MAX_CIRCLES || newCount === processedCircleCount) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);

    // 새로 추가된 원만 부분 업데이트
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

  // 캔버스 리사이즈
  const handleResize = (cssWidth: number, cssHeight: number) => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    projectionMatrix = Matrix3.projection(cssWidth, cssHeight);
    requestRender();
  };

  // 카메라 이동 감지
  const unsubscribeCamera = cameraStore.subscribe('camera', requestRender);

  // 원 생성 감지
  const unsubscribeCircle = circleStore.subscribe('version', updateCircleBuffers);

  // 가이드 원 이동 (마우스 이동) 감지
  const unsubscribeGuide = guideCircleStore.subscribe('guideCircle', requestRender);

  // 캔버스 크기 변경 감지
  const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    handleResize(width, height);
  });
  resizeObserver.observe(canvas);

  // 요소가 제거될 때 메모리 해제
  cleanupTasks.push(() => {
    resizeObserver.disconnect();
    unsubscribeCamera();
    unsubscribeCircle();
    unsubscribeGuide();
  });

  // 렌더링 시 최초 1회 실행
  handleResize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
};
