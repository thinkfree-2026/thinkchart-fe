export const increaseCounter = (callbackFn: (currentCount: number) => void) => {
  let count = 1;
  let intervalId: number | null = null;

  return {
    get currentCount() {
      return count;
    },
    start() {
      if (intervalId !== null) return;
      intervalId = window.setInterval(() => {
        count += 0.5;
        callbackFn(count);
      }, 1000);
    },
    stop() {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      const currentCount = count;
      count = 1; // 카운트 초기화
      return currentCount;
    },
    cancel() {
      if (intervalId !== null) window.clearInterval(intervalId);
      intervalId = null;
      count = 1;
    },
  };
};
