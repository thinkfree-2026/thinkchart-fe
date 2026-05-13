import type { CursorResponse } from './socketTypes.ts';
import { websocketClient } from './stompClient.ts';

export const canvasSocket = {
  sendCursorPosition: (cursor: CursorResponse) => {
    if (!websocketClient.connected) return;

    websocketClient.publish({
      destination: `/app/canvas/cursor`,
      body: JSON.stringify(cursor),
    });
  },
};
