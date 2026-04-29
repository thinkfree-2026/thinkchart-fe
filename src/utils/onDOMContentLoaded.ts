export const onDOMContentLoaded = (element: HTMLElement, callbackFn: () => void) => {
  if (element == null) return;
  element.addEventListener('DOMContentLoaded', callbackFn);
};
