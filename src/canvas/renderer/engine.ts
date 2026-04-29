import { Matrix3 } from '../core/index.ts';
import { cameraStore } from '../store/index.ts';
import { initWebGL } from '../webgl/index.ts';

/**
 * WebGL 렌더링 엔진
 * Store의 데이터를 읽어와 실제 WebGL 파이프라인 구동
 */
export const createEngine = (canvas: HTMLCanvasElement, cleanupTasks: Array<() => void>) => {
  const { gl, program } = initWebGL(canvas);

  let projectionMatrix = Matrix3.projection(canvas.width, canvas.height);
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

    const camera = cameraStore.getState();

    Matrix3.translateAndScale(viewMatrix, camera.x, camera.y, camera.scale);

    finalMatrix[0] = projectionMatrix[0] * viewMatrix[0];
    finalMatrix[4] = projectionMatrix[4] * viewMatrix[4];
    finalMatrix[6] = projectionMatrix[0] * viewMatrix[6] + projectionMatrix[6];
    finalMatrix[7] = projectionMatrix[4] * viewMatrix[7] + projectionMatrix[7];
    finalMatrix[8] = 1.0;

    gl.uniformMatrix3fv(uMatrixLoc, false, finalMatrix);
    gl.uniform1f(uZoomLoc, camera.scale);
    gl.uniform1f(uDprLoc, window.devicePixelRatio || 1);
  };

  const requestRender = () => {
    if (!isRenderPending) {
      isRenderPending = true;
      requestAnimationFrame(render);
    }
  };

  // 리사이즈 감지
  const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    projectionMatrix = Matrix3.projection(width, height);
    requestRender();
  });
  resizeObserver.observe(canvas);

  // 카메라 상태 구독
  const unsubCamera = cameraStore.subscribe(requestRender);

  // 언마운트 시 엔진 정리
  cleanupTasks.push(() => {
    resizeObserver.disconnect();
    unsubCamera();
  });

  // 렌더링 시 최초 한 번 실행
  requestRender();
};
