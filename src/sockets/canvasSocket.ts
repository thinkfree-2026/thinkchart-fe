import type { Cursor } from './socketTypes.ts';
import { websocketClient } from './stompClient.ts';

export const canvasSocket = {
  sendCursorPosition: (chartId: string, cursorInfo: Cursor) => {
    if (!websocketClient.connected) return;

    websocketClient.publish({
      destination: `/app/canvas/${chartId}/cursor`,
      body: JSON.stringify(cursorInfo),
    });
  },
};
