import { axisStore, dataSettingsStore } from '../store/index.ts';

type CreateSubscriptionsParams = {
  scrollContainer: HTMLElement | null;
};

// 언제 redraw 할 지 관리
export const createSubscriptions = ({ scrollContainer }: CreateSubscriptionsParams) => {
  const subscribeAxisRedraw = (redraw: () => void) => {
    const unsubs: (() => void)[] = [];

    (['showXAxisName', 'xAxisName', 'showYAxisName', 'yAxisName'] as const).forEach(key => {
      unsubs.push(axisStore.subscribe(key, redraw));
    });

    return () => unsubs.forEach(u => u());
  };

  const subscribeDataRedraw = (redraw: () => void) => {
    const unsubs: (() => void)[] = [];

    (['showDataValues', 'showPercentage', 'showSum'] as const).forEach(key => {
      unsubs.push(dataSettingsStore.subscribe(key, redraw));
    });

    return () => unsubs.forEach(u => u());
  };

  const subscribeViewportRedraw = (redraw: () => void) => {
    if (!scrollContainer) return () => {};

    const onScroll = () => redraw();

    scrollContainer.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', onScroll);
    };
  };

  return {
    subscribeAxisRedraw,
    subscribeDataRedraw,
    subscribeViewportRedraw,
  };
};
