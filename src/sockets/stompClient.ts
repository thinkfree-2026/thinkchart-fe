import { userStore } from '../canvas/store/index.ts';

import { canvasSocket } from './canvasSocket.ts';
import { type ChartSocketMessage, handleChartSocketMessage } from './chartSocketHandler.ts';
import { type CircleSocketMessage, handleCircleSocketMessage } from './circleSocketHandler.ts';
import { type CursorSocketMessage, handleCursorSocketMessage } from './cursorSocketHandler.ts';
import type { UserResponse } from './socketTypes.ts';

import { Client } from '@stomp/stompjs';

type SocketMessage = CursorSocketMessage | CircleSocketMessage | ChartSocketMessage;

export const websocketClient = new Client({
  brokerURL: `${import.meta.env.VITE_WS_BROKER_URL}`,

  onConnect: () => {
    websocketClient.subscribe('/topic/canvas', message => {
      const data = JSON.parse(message.body) as SocketMessage;

      if (data.action.startsWith('CURSOR')) handleCursorSocketMessage(data as CursorSocketMessage);
      else if (data.action.startsWith('CIRCLE')) handleCircleSocketMessage(data as CircleSocketMessage);
      else if (data.action.startsWith('CHART')) handleChartSocketMessage(data as ChartSocketMessage);
    });

    websocketClient.subscribe('/user/queue/me', message => {
      const data = JSON.parse(message.body) as UserResponse;
      userStore.setUser(data.payload.userId, data.payload.color);
    });

    canvasSocket.getUserId();
  },

  onStompError: () => {},
});

export const connectWebSocket = () => {
  websocketClient.activate();
};
