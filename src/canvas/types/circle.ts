export type Circle = {
  id: string;
  chartId: string | null;
  x: number; // 원의 월드 X 좌표
  y: number; // 원의 월드 Y 좌표
  value: number; // 원의 값
  radius: number; // 원의 반지름
  color: string; // 원의 색상
  opacity?: number;
};

// 가이드 UI의 상태 타입 정의
export type GuideCircle = {
  circle: Circle | null;
  isVisible: boolean; // 가이드 원의 화면 표시 여부
};
