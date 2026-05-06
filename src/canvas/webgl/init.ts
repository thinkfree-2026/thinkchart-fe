// 인스턴스 렌더링에 사용되는 원 전용 버텍스 셰이더
const vertexShaderConfig = `
  attribute vec2 a_position;
  attribute vec2 a_instance_pos;
  attribute float a_instance_size;
  attribute vec4 a_instance_color;

  uniform mat3 u_matrix;
  uniform vec3 u_hovered_info;  // 호버 상태인 원의 위치 및 크기 정보 (x, y, size)
  uniform vec3 u_selected_info; // 선택 상태인 원의 위치 및 크기 정보 (x, y, size)

  varying vec2 v_uv;
  varying vec4 v_color;
  varying float v_size; 
  varying float v_hide_border;  // 프래그먼트 셰이더로 전달할 테두리 숨김 플래그

  void main() {
    v_uv = a_position; 
    v_size = a_instance_size; 
    
    // 개별 정점의 기준 좌표를 원의 크기에 맞게 확장하고 월드 좌표 위치로 이동
    vec2 world_pos = ((a_position - vec2(0.5, 0.5)) * a_instance_size) + a_instance_pos;
    
    // 카메라 줌 및 패닝이 적용된 변환 행렬을 곱하여 최종 화면 좌표 도출
    vec3 final_pos = u_matrix * vec3(world_pos, 1.0);
    
    gl_Position = vec4(final_pos.xy, 0.0, 1.0);
    v_color = a_instance_color;

    // 현재 렌더링 중인 원이 호버 또는 선택된 원인지 위치와 크기를 비교하여 판별
    // GPU 부동소수점 연산 오차를 방지하기 위해 0.5 미만의 차이는 동일한 객체로 간주
    bool is_hovered = abs(a_instance_pos.x - u_hovered_info.x) < 0.5 && 
                      abs(a_instance_pos.y - u_hovered_info.y) < 0.5 && 
                      abs(a_instance_size - u_hovered_info.z) < 0.5;

    bool is_selected = abs(a_instance_pos.x - u_selected_info.x) < 0.5 && 
                       abs(a_instance_pos.y - u_selected_info.y) < 0.5 && 
                       abs(a_instance_size - u_selected_info.z) < 0.5;

    // 호버되거나 선택된 상태라면 1.0을 할당하여 테두리를 렌더링하지 않도록 지시
    v_hide_border = (is_hovered || is_selected) ? 1.0 : 0.0;
  }
`;

// 원의 형태를 다듬고 테두리 및 색상을 처리하는 프래그먼트 셰이더
const fragmentShaderConfig = `
  precision mediump float;

  varying vec2 v_uv;
  varying vec4 v_color;
  varying float v_size;
  varying float v_hide_border;

  uniform float u_zoom;
  uniform float u_dpr; 

  void main() {
    // 중심점(0.5, 0.5)으로부터의 거리를 계산하여 원형 영역 판별
    float dist = distance(v_uv, vec2(0.5, 0.5));
    
    // 화면에 렌더링되는 원의 물리적 픽셀 반지름 계산
    float physicalRadius = (v_size * u_zoom * u_dpr) * 0.5;
    
    // 1픽셀에 해당하는 UV 좌표계 상의 거리 단위 도출
    float pixelUnit = 1.0 / physicalRadius; 
    
    // 외곽선 안티앨리어싱(부드러운 경계)을 적용할 1픽셀 범위 지정
    float aaRange = 1.0 * pixelUnit;        

    // 월드 공간을 기준으로 테두리 두께 설정
    // 줌 인/아웃 시 카메라 배율에 맞춰 테두리 두께가 자연스럽게 변함
    float borderThickness = 0.75 / v_size; 

    // 원의 바깥쪽 경계를 부드럽게 깎아냄
    float outerAlpha = 1.0 - smoothstep(0.5 - aaRange, 0.5, dist);
    
    // 테두리가 그려질 영역의 보간 값 계산
    float borderFactor = smoothstep(0.5 - borderThickness - aaRange, 0.5 - borderThickness, dist);
    
    // 렌더링 중인 원이 하이라이트 대상일 경우 기본 테두리 렌더링 제외
    if (v_hide_border > 0.5) {
      borderFactor = 0.0;
    }

    // 기본 테두리 색상 지정 (#818CF8)
    vec3 borderColor = vec3(129.0 / 255.0, 140.0 / 255.0, 248.0 / 255.0); 
    
    // 원본 색상과 테두리 색상을 혼합
    vec3 finalRGB = mix(v_color.rgb, borderColor, borderFactor);
    
    // 원형 범위를 벗어난 픽셀은 렌더링에서 제외하여 성능 최적화
    if (outerAlpha <= 0.0) discard;
    
    gl_FragColor = vec4(finalRGB, v_color.a * outerAlpha);
  }
`;

// 바운딩 박스 및 하이라이트 렌더링을 위한 UI 전용 버텍스 셰이더
const uiVertexShaderConfig = `
  attribute vec2 a_position;
  uniform mat3 u_matrix;

  void main() {
    vec3 final_pos = u_matrix * vec3(a_position, 1.0);
    gl_Position = vec4(final_pos.xy, 0.0, 1.0);
  }
`;

// 바운딩 박스 및 하이라이트 렌더링을 위한 UI 전용 프래그먼트 셰이더
const uiFragmentShaderConfig = `
  precision mediump float;
  uniform vec4 u_color;

  void main() {
    // 외부에서 전달받은 단일 색상으로 출력
    gl_FragColor = u_color;
  }
`;

// WebGL 컨텍스트 및 셰이더 프로그램 초기화 유틸리티
export const initWebGL = (
  canvas: HTMLCanvasElement
): { gl: WebGLRenderingContext; circleProgram: WebGLProgram; uiProgram: WebGLProgram } => {
  // 브라우저 GPU 안티앨리어싱 강제 적용 옵션을 사용할 경우 아래 주석 해제
  // const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false });
  const gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL을 지원하지 않는 브라우저임');
  }

  // 셰이더 소스 코드를 컴파일하는 헬퍼 함수
  const compileShader = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error('셰이더 인스턴스 생성 실패');
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // 컴파일 상태 검증 및 에러 로깅
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('셰이더 컴파일 실패');
    }
    return shader;
  };

  // 원 렌더링 프로그램 초기화
  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderConfig);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderConfig);

  const circleProgram = gl.createProgram();
  if (circleProgram == null) {
    throw new Error('원 렌더링 프로그램 객체 생성 실패');
  }

  gl.attachShader(circleProgram, vertexShader);
  gl.attachShader(circleProgram, fragmentShader);
  gl.linkProgram(circleProgram);

  if (gl.getProgramParameter(circleProgram, gl.LINK_STATUS) !== true) {
    throw new Error('원 렌더링 프로그램 링킹 실패');
  }

  // UI 렌더링 프로그램 초기화
  const uiVertShader = compileShader(gl.VERTEX_SHADER, uiVertexShaderConfig);
  const uiFragShader = compileShader(gl.FRAGMENT_SHADER, uiFragmentShaderConfig);

  const uiProgram = gl.createProgram();
  if (uiProgram == null) {
    throw new Error('UI 렌더링 프로그램 객체 생성 실패');
  }

  gl.attachShader(uiProgram, uiVertShader);
  gl.attachShader(uiProgram, uiFragShader);

  // 원 렌더러가 사용하는 0번 속성 공간과의 충돌을 방지하기 위해 5번 속성 공간으로 격리
  gl.bindAttribLocation(uiProgram, 5, 'a_position');
  gl.linkProgram(uiProgram);

  if (gl.getProgramParameter(uiProgram, gl.LINK_STATUS) !== true) {
    throw new Error('UI 렌더링 프로그램 링킹 실패');
  }

  // 알파 블렌딩 활성화
  gl.enable(gl.BLEND);

  // 색상 혼합(셀로판지 효과)과 투명도 혼합(캔버스 배경 불투명도 유지) 방식을 분리하여 적용
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  return { gl, circleProgram, uiProgram };
};
