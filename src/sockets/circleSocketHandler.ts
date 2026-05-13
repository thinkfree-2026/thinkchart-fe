import { CIRCLE_RADIUS, CIRCLE_VALUE } from '../canvas/constants/index.ts';
import { circleStore } from '../canvas/store/index.ts';

import type { CircleResponse } from './socketTypes.ts';

export type CircleSocketMessage =
  | {
      action: 'CIRCLE_CREATED' | 'CIRCLE_UPDATED';
      payload: CircleResponse;
    }
  | {
      action: 'CIRCLE_DELETED';
      payload: CircleResponse[];
    };

export const handleCircleSocketMessage = (message: CircleSocketMessage) => {
  switch (message.action) {
    case 'CIRCLE_CREATED': {
      const circle = message.payload;
      circleStore.addCircle({
        ...circle,
        radius: CIRCLE_RADIUS * Math.sqrt(circle.value / CIRCLE_VALUE),
      });
      break;
    }
    // case 'CIRCLE_UPDATED': {
    //   console.log(message.payload);
    //   break;
    // }
    case 'CIRCLE_DELETED': {
      const circles = message.payload;
      circles.forEach(circle => circleStore.deleteCircle(circle.id));
      break;
    }
  }
};
