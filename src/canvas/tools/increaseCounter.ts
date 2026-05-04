export const increaseCounter = (
  onIncrease: (currentCount: number) => void,
  onAnimate: (pulseSize: number, currentCount: number) => void
) => {
  let count = 1;
  let intervalId: number | null = null;
  let rafId: number | null = null;

  const renderAnimate = (time: DOMHighResTimeStamp) => {
    const sineWave = Math.sin(time / 50);
    const pulseSize = sineWave * Math.min(count * 1.5, 5);

    onAnimate(pulseSize, count);
    rafId = requestAnimationFrame(renderAnimate);
  };

  return {
    get currentCount() {
      return count;
    },
    get isCharging() {
      return intervalId !== null;
    },
    start() {
      if (intervalId !== null) return;

      intervalId = window.setInterval(() => {
        count++;
        onIncrease(count);
      }, 1000);

      rafId = requestAnimationFrame(renderAnimate);
    },
    stop() {
      if (intervalId !== null) window.clearInterval(intervalId);
      if (rafId !== null) cancelAnimationFrame(rafId);

      intervalId = null;
      rafId = null;

      const currentCount = count;
      count = 1;

      return currentCount;
    },
    cancel() {
      if (intervalId !== null) window.clearInterval(intervalId);
      if (rafId !== null) cancelAnimationFrame(rafId);

      intervalId = null;
      rafId = null;
      count = 1;
    },
  };
};
