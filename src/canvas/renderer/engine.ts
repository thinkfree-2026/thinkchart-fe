import { Matrix3 } from '../core/index.ts';
import { cameraStore } from '../store/index.ts';
import { initWebGL, setupInstancedBuffers } from '../webgl/index.ts';

export const createEngine = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  const { gl, program } = initWebGL(canvas);

  // ==========================================
  // 임시 원 1개 데이터 세팅
  // ==========================================
  const centerX = (canvas.clientWidth || window.innerWidth) / 2;
  const centerY = (canvas.clientHeight || window.innerHeight) / 2;
  const circleData = new Float32Array([centerX, centerY, 300.0, 99 / 255, 102 / 255, 241 / 255, 1.0]);

  // ==========================================
  // 임시 원을 위한 인스턴싱 버퍼 초기화 및 확장 기능
  // ==========================================
  const { ext } = setupInstancedBuffers(gl, program, circleData);

  let projectionMatrix = Matrix3.create();
  const viewMatrix = Matrix3.create();
  const finalMatrix = Matrix3.create();

  const uMatrixLoc = gl.getUniformLocation(program, 'u_matrix');
  const uZoomLoc = gl.getUniformLocation(program, 'u_zoom');
  const uDprLoc = gl.getUniformLocation(program, 'u_dpr');

  let isRenderPending = false;

  const render = () => {
    isRenderPending = false;
    if (gl == null || projectionMatrix == null) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    const camera = cameraStore.state.camera;

    Matrix3.translateAndScale(viewMatrix, camera.x, camera.y, camera.scale);

    finalMatrix[0] = projectionMatrix[0] * viewMatrix[0];
    finalMatrix[4] = projectionMatrix[4] * viewMatrix[4];
    finalMatrix[6] = projectionMatrix[0] * viewMatrix[6] + projectionMatrix[6];
    finalMatrix[7] = projectionMatrix[4] * viewMatrix[7] + projectionMatrix[7];
    finalMatrix[8] = 1.0;

    gl.uniformMatrix3fv(uMatrixLoc, false, finalMatrix);
    gl.uniform1f(uZoomLoc, camera.scale);
    gl.uniform1f(uDprLoc, window.devicePixelRatio || 1);

    // ==========================================
    // 임시 원 인스턴스 1개를 그리는 로직
    // ==========================================
    ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, 1);
  };

  const requestRender = () => {
    if (!isRenderPending) {
      isRenderPending = true;
      requestAnimationFrame(render);
    }
  };

  const handleResize = (cssWidth: number, cssHeight: number) => {
    const dpr = window.devicePixelRatio || 1;

    // 캔버스 자체의 해상도 = 물리 픽셀
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;

    // WebGL 투영 행렬 = 마우스와 동일한 CSS 픽셀
    projectionMatrix = Matrix3.projection(cssWidth, cssHeight);

    requestRender();
  };

  handleResize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);

  // 리사이즈 감지
  const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    handleResize(width, height);
  });
  resizeObserver.observe(canvas);

  // 카메라 상태 구독
  const unsubCamera = cameraStore.subscribe('camera', requestRender);

  // 엔진 정리 Cleanup 콜백 함수
  cleanupTasks.push(() => {
    resizeObserver.disconnect();
    unsubCamera();
  });

  // 렌더링 시 최초 한 번 실행
  requestRender();
};
