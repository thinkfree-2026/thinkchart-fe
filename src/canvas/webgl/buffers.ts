export const setupInstancedBuffers = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  instanceData: Float32Array // [x, y, size, r, g, b, a, x, y, size, r, g, b, a, ...]
) => {
  // WebGL 1.0에서 인스턴싱을 사용하기 위한 확장 기능 활성화
  const ext = gl.getExtension('ANGLE_instanced_arrays');
  if (!ext) throw new Error('인스턴싱을 지원하지 않는 브라우저입니다.');

  // 기본 도형 (0.0 ~ 1.0 크기의 사각형에 대한 꼭짓점 4개) 세팅
  const quadVertices = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  // 인스턴스 데이터 (원의 위치, 크기, 색상) 버퍼 세팅
  const instanceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  // DYNAMIC_DRAW: 데이터가 자주 변경될 것임을 GPU에 알림
  gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.DYNAMIC_DRAW);

  // 데이터 구조: x, y, size, r, g, b, a = 7개의 float(28바이트)
  const STRIDE = 7 * Float32Array.BYTES_PER_ELEMENT;

  // a_instance_pos (x, y)
  const aInstancePos = gl.getAttribLocation(program, 'a_instance_pos');
  gl.enableVertexAttribArray(aInstancePos);
  gl.vertexAttribPointer(aInstancePos, 2, gl.FLOAT, false, STRIDE, 0);
  ext.vertexAttribDivisorANGLE(aInstancePos, 1);

  // a_instance_size (size)
  const aInstanceSize = gl.getAttribLocation(program, 'a_instance_size');
  gl.enableVertexAttribArray(aInstanceSize);
  gl.vertexAttribPointer(aInstanceSize, 1, gl.FLOAT, false, STRIDE, 2 * 4);
  ext.vertexAttribDivisorANGLE(aInstanceSize, 1);

  // a_instance_color (r, g, b, a)
  const aInstanceColor = gl.getAttribLocation(program, 'a_instance_color');
  gl.enableVertexAttribArray(aInstanceColor);
  gl.vertexAttribPointer(aInstanceColor, 4, gl.FLOAT, false, STRIDE, 3 * 4);
  ext.vertexAttribDivisorANGLE(aInstanceColor, 1);

  return { instanceBuffer, ext };
};
