import { type ChartSocketMessage, handleChartSocketMessage } from './chartSocketHandler.ts';

import { Client } from '@stomp/stompjs';

export const websocketClient = new Client({
  brokerURL: `${import.meta.env.VITE_WS_BROKER_URL}`,

  onConnect: () => {
    websocketClient.subscribe('/topic/canvas', message => {
      const data = JSON.parse(message.body) as ChartSocketMessage;
      if (data.action.startsWith('CHART')) handleChartSocketMessage(data);
    });
  },

  onStompError: () => {},
});

export const connectWebSocket = () => {
  websocketClient.activate();
};
