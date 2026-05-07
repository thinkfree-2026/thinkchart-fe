export const createRef = <T = HTMLElement>(initialValue: T | null = null) => {
  return { current: initialValue };
};
