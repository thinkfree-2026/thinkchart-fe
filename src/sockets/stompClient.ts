import { type ChartSocketMessage, handleChartSocketMessage } from './chartSocketHandler.ts';
import { type CircleSocketMessage, handleCircleSocketMessage } from './circleSocketHandler.ts';
import { type CursorSocketMessage, handleCursorSocketMessage } from './cursorSocketHandler.ts';

import { Client } from '@stomp/stompjs';

type SockectMessage = CursorSocketMessage | CircleSocketMessage | ChartSocketMessage;

export const websocketClient = new Client({
  brokerURL: `${import.meta.env.VITE_WS_BROKER_URL}`,

  onConnect: () => {
    websocketClient.subscribe('/topic/canvas', message => {
      const data = JSON.parse(message.body) as SockectMessage;

      if (data.action.startsWith('CURSOR')) handleCursorSocketMessage(data);
      else if (data.action.startsWith('CIRCLE')) handleCircleSocketMessage(data);
      else if (data.action.startsWith('CHART')) handleChartSocketMessage(data);
    });
  },

  onStompError: () => {},
});

export const connectWebSocket = () => {
  websocketClient.activate();
};
