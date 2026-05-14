/* eslint-disable @typescript-eslint/no-explicit-any */
export const throttle = <T extends (...args: any[]) => void>(callbackFn: T, limit: number = 100) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      callbackFn(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};
