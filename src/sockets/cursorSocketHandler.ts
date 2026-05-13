import { cursorStore, userStore } from '../canvas/store/index.ts';

import type { CursorResponse } from './socketTypes.ts';

export type CursorSocketMessage = {
  action: 'CURSOR_MOVE';
  payload: CursorResponse;
};

export const handleCursorSocketMessage = (message: CursorSocketMessage) => {
  switch (message.action) {
    case 'CURSOR_MOVE': {
      const { userId } = userStore.state;

      if (userId !== message.payload.id) cursorStore.setCursor(message.payload);
      break;
    }
  }
};
