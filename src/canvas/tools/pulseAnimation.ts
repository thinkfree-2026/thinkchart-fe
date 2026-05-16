// 원의 크기가 증가하는 애니메이션 상태 및 타이머 관리 객체 생성
export const createPulseAnimation = (
  onIncrease: (currentCount: number) => void,
  onAnimate: (pulseSize: number, currentCount: number) => void
) => {
  let count = 1;
  let intervalId: number | null = null;
  let animationFrameId: number | null = null;

  // 펄스 애니메이션 계산 및 콜백 실행
  const renderAnimate = (time: DOMHighResTimeStamp) => {
    const sineWave = Math.sin(time / 50);
    const pulseSize = sineWave * Math.min(count * 1.5, 5);

    onAnimate(pulseSize, count);
    animationFrameId = requestAnimationFrame(renderAnimate);
  };

  return {
    get currentCount() {
      return count;
    },
    get isCharging() {
      return intervalId !== null;
    },

    // 타이머 및 애니메이션 루프 시작
    start() {
      if (intervalId !== null) return;

      intervalId = window.setInterval(() => {
        count++;
        onIncrease(count);
      }, 1000);

      animationFrameId = requestAnimationFrame(renderAnimate);
    },

    // 진행 중인 애니메이션을 정상 종료하고 최종 카운트 반환
    stop() {
      if (intervalId !== null) window.clearInterval(intervalId);
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);

      intervalId = null;
      animationFrameId = null;

      const currentCount = count;
      count = 1;

      return currentCount;
    },

    // 마우스 이탈 등으로 인한 애니메이션 강제 취소
    cancel() {
      if (intervalId !== null) window.clearInterval(intervalId);
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);

      intervalId = null;
      animationFrameId = null;
      count = 1;
    },
  };
};
