import { circleStore } from '../store/index.ts';

// 마우스 커서의 월드 좌표를 기준으로 내부에 존재하는 원의 인덱스 탐색
export const getHoveredCircleIndex = (worldX: number, worldY: number) => {
  const circles = circleStore.getCircles();

  // 가장 위에 그려진(배열의 마지막) 원부터 역순으로 충돌 여부 검사
  for (let index = circles.length - 1; index >= 0; index--) {
    const circle = circles[index];
    const deltaX = worldX - circle.x;
    const deltaY = worldY - circle.y;
    const radius = circle.radius;

    // if (deltaX * deltaX + deltaY * deltaY <= radius * radius) {
    //   return index;
    // }

    if (Math.abs(deltaX) <= radius && Math.abs(deltaY) <= radius) {
      return index;
    }
  }

  return -1;
};
