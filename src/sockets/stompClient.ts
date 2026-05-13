/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CIRCLE_RADIUS, CIRCLE_VALUE } from '../canvas/constants/index.ts';
import { circleStore, cursorStore } from '../canvas/store/index.ts';

import type { ChartResponse, CircleResponse, CursorResponse } from './socketTypes.ts';

import { Client } from '@stomp/stompjs';

type WebSocketMessage = {
  action: keyof typeof actionHandlers;
  payload: any;
};

const actionHandlers = {
  // CURSOR_ENTER: (data: Cursor) => console.log(data),
  CURSOR_MOVE: (data: CursorResponse) => {
    cursorStore.setCursor(data);
  },
  // CURSOR_LEAVE: (data: Cursor) => console.log(data),
  // CIRCLE_DRAW_START: (data: Circle) => console.log(data),
  // CIRCLE_DRAW_UPDATE: (data: Circle) => console.log(data),
  CIRCLE_CREATED: (data: CircleResponse) => {
    circleStore.addCircle({
      ...data,
      radius: CIRCLE_RADIUS * Math.sqrt(data.value / CIRCLE_VALUE),
    });
  },
  // CIRCLE_UPDATED: (data: Circle) => console.log(data),
  CIRCLE_DELETED: (data: CircleResponse[]) => {
    data.forEach(circle => circleStore.deleteCircle(circle.id));
  },
  // CIRCLE_FOCUSED: (data: Circle) => console.log(data),
  CHART_CREATED: (data: ChartResponse) => {
    circleStore.getCircles().forEach(circle => {
      if (data.circleIds.includes(circle.id)) {
        circle.chartId = data.id;
      }
    });
  },
};

export const websocketClient = new Client({
  brokerURL: `${import.meta.env.VITE_WS_BROKER_URL}`,
  onConnect: () => {
    websocketClient.subscribe('/topic/canvas', message => {
      const res = JSON.parse(message.body) as WebSocketMessage;

      const action = res.action;
      const payload = res.payload;

      const handler = actionHandlers[action];
      if (typeof handler === 'function') {
        handler(payload);
      } else {
        console.warn(`웹소켓 에러: 액션 (${String(action)})`);
      }
    });
  },
  onStompError: () => {},
});

export const connectWebSocket = () => {
  websocketClient.activate();
};
