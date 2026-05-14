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
      const isNewCircle = circleStore
        .getCircles()
        .some(circle => circle.userId === message.payload.userId && circle.id === '');

      if (isNewCircle) {
        circleStore.updateCircleUserId(message.payload.userId, message.payload.id);
      } else {
        circleStore.addCircle({
          ...message.payload,
          radius: CIRCLE_RADIUS * Math.sqrt(message.payload.value / CIRCLE_VALUE),
        });
      }
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
