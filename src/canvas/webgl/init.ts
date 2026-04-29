// 버텍스 셰이더
const vertexShaderConfig = `
  attribute vec2 a_position;
  attribute vec2 a_instance_pos;
  attribute float a_instance_size;
  attribute vec4 a_instance_color;

  uniform mat3 u_matrix;

  varying vec2 v_uv;
  varying vec4 v_color;
  varying float v_size; // 프래그먼트 셰이더로 크기 전달

  void main() {
    v_uv = a_position; 
    v_size = a_instance_size; // 원의 지름 전달
    
    vec2 world_pos = ((a_position - vec2(0.5, 0.5)) * a_instance_size) + a_instance_pos;
    vec3 final_pos = u_matrix * vec3(world_pos, 1.0);
    
    gl_Position = vec4(final_pos.xy, 0.0, 1.0);
    
    v_color = a_instance_color;
  }
`;

// 프래그먼트 셰이더
const fragmentShaderConfig = `
  precision mediump float;

  varying vec2 v_uv;
  varying vec4 v_color;
  varying float v_size;

  uniform float u_zoom;
  uniform float u_dpr; // 디바이스 픽셀 비율 (모니터 해상도 밀도)

  void main() {
    float dist = distance(v_uv, vec2(0.5, 0.5));
    
    // 화면에 렌더링되는 물리적 픽셀 지름 계산
    // float physicalSize = max(v_size * u_zoom * u_dpr, 1.0);
    float physicalSize = (v_size * u_zoom * u_dpr) * 0.5;
    
    // 테두리 두께를 0.8로 줄여서 선명함 유지
    float edgeWidth = 0.8 / physicalSize;

    // 최대 45%의 블러를 허용하여 중심부 색상 유지
    edgeWidth = min(edgeWidth, 0.45);
    
    // 테두리 계산
    float alpha = 1.0 - smoothstep(0.5 - edgeWidth * 1.5, 0.5, dist);
    
    if (alpha <= 0.0) discard;
    
    gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
  }
`;

// WebGL 초기화 유틸리티
export const initWebGL = (canvas: HTMLCanvasElement): { gl: WebGLRenderingContext; program: WebGLProgram } => {
  const gl = canvas.getContext('webgl');

  if (!gl) throw new Error('WebGL을 지원하지 않는 브라우저입니다.');

  // 셰이더 컴파일 헬퍼 함수
  const compileShader = (type: number, source: string) => {
    const shader = gl.createShader(type)!;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (
      gl.getShaderParameter(shader, gl.COMPILE_STATUS) === undefined ||
      gl.getShaderParameter(shader, gl.COMPILE_STATUS) === null
    ) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('셰이더 컴파일 실패');
    }
    return shader;
  };

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderConfig);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderConfig);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (
    gl.getProgramParameter(program, gl.LINK_STATUS) === undefined ||
    gl.getProgramParameter(program, gl.LINK_STATUS) === null
  ) {
    throw new Error('WebGL 프로그램 링킹 실패');
  }

  // 투명도 혼합 활성화
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  return { gl, program };
};
