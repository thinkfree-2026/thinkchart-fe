export type Circle = {
  x: number; // 원의 월드 X 좌표
  y: number; // 원의 월드 Y 좌표
  size: number; // 원의 크기
  r: number; // 원의 R 값
  g: number; // 원의 G 값
  b: number; // 원의 B 값
  a: number; // 원의 A 값
};

// 가이드 UI의 상태 타입 정의
export type GuideCircle = {
  x: number; // 가이드 원의 월드 X 좌표
  y: number; // 가이드 원의 월드 Y 좌표
  visible: boolean; // 가이드 원의 화면 표시 여부
};
