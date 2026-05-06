export const setupInstancedBuffers = (gl: WebGLRenderingContext, program: WebGLProgram, instanceData: Float32Array) => {
  // WebGL 1.0 환경에서 대규모 객체의 병렬 렌더링을 처리하기 위해 ANGLE 확장 기능 활성화
  const ext = gl.getExtension('ANGLE_instanced_arrays');

  if (!ext) {
    throw new Error('인스턴스 렌더링을 지원하지 않는 브라우저 환경임');
  }

  // 개별 인스턴스의 뼈대가 되는 기본 도형(0.0 ~ 1.0 크기의 사각형)의 정점 좌표 정의
  const quadVertices = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

  // 기본 도형의 정점 데이터를 셰이더의 a_position 속성에 연결
  const aPosition = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  // 개별 원들의 고유 상태(위치, 크기, 색상)를 담을 동적 인스턴스 버퍼 생성 및 바인딩
  const instanceBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);

  // 데이터가 유저 인터랙션에 의해 자주 업데이트될 수 있음을 GPU에 힌트로 전달하여 메모리 접근 최적화
  gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.DYNAMIC_DRAW);

  // 단일 인스턴스가 차지하는 메모리 보폭(Stride) 계산
  // 데이터 구조: x, y, size, r, g, b, a (총 7개의 32비트 부동소수점 = 28바이트)
  const STRIDE = 7 * Float32Array.BYTES_PER_ELEMENT;

  // 인스턴스의 기준 좌표(x, y) 속성 활성화 및 데이터 매핑
  const aInstancePos = gl.getAttribLocation(program, 'a_instance_pos');
  gl.enableVertexAttribArray(aInstancePos);
  // 오프셋 0부터 시작하여 2개의 float 데이터를 읽음
  gl.vertexAttribPointer(aInstancePos, 2, gl.FLOAT, false, STRIDE, 0);
  // 해당 속성이 정점마다가 아닌 인스턴스마다 한 번씩 전진하도록 디바이저 설정
  ext.vertexAttribDivisorANGLE(aInstancePos, 1);

  // 인스턴스의 크기(size) 속성 활성화 및 데이터 매핑
  const aInstanceSize = gl.getAttribLocation(program, 'a_instance_size');
  gl.enableVertexAttribArray(aInstanceSize);
  // x, y (2개의 float = 8바이트) 이후부터 1개의 float 데이터를 읽음
  gl.vertexAttribPointer(aInstanceSize, 1, gl.FLOAT, false, STRIDE, 2 * Float32Array.BYTES_PER_ELEMENT);
  ext.vertexAttribDivisorANGLE(aInstanceSize, 1);

  // 인스턴스의 색상(r, g, b, a) 속성 활성화 및 데이터 매핑
  const aInstanceColor = gl.getAttribLocation(program, 'a_instance_color');
  gl.enableVertexAttribArray(aInstanceColor);
  // x, y, size (3개의 float = 12바이트) 이후부터 4개의 float 데이터를 읽음
  gl.vertexAttribPointer(aInstanceColor, 4, gl.FLOAT, false, STRIDE, 3 * Float32Array.BYTES_PER_ELEMENT);
  ext.vertexAttribDivisorANGLE(aInstanceColor, 1);

  // 렌더링 루프에서 버퍼를 부분 갱신하거나 그릴 때 참조할 수 있도록 반환
  return { instanceBuffer, ext };
};
