import { websocketClient } from './stompClient.ts';

import type { StompSubscription } from '@stomp/stompjs';

let currentChartSession: StompSubscription | null = null;

type ChartSocketMessage =
  | {
      action: 'CHART_BAR_UPDATED';
      payload: {
        chartId: string;
        circleId: string;
        color: string;
        name: string;
        value: number;
        opacity: number;
      };
    }
  | {
      action: 'CHART_BAR_DELETED';
      payload: string;
    };

export const chartSocket = {
  enterChartSession: (chartId: string, onMessage: (message: ChartSocketMessage) => void) => {
    if (!websocketClient.connected) return;

    chartSocket.leaveChartSession();

    currentChartSession = websocketClient.subscribe(`/topic/canvas/charts/${chartId}`, message => {
      const parsed: unknown = JSON.parse(message.body);
      const parsedMessage = parsed as ChartSocketMessage;
      onMessage(parsedMessage);
    });
  },

  leaveChartSession: () => {
    if (!currentChartSession) return;

    currentChartSession.unsubscribe();
    currentChartSession = null;
  },
};
