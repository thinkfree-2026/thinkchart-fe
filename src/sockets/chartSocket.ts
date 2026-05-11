import { websocketClient } from './stompClient.ts';

import type { StompSubscription } from '@stomp/stompjs';

let currentChartSession: StompSubscription | null = null;

export const chartSocket = {
  enterChartSession: (chartId: string) => {
    if (!websocketClient.connected) return;

    chartSocket.leaveChartSession();

    currentChartSession = websocketClient.subscribe(`/topic/canvas/${chartId}`, () => {});
  },

  leaveChartSession: () => {
    if (!currentChartSession) return;

    currentChartSession.unsubscribe();
    currentChartSession = null;
  },
};
