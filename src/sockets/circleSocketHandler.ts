import { CIRCLE_RADIUS, MAX_RADIUS, RADIUS_RATIO } from '../canvas/constants/index.ts';
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
      const isMyCircle = circleStore.getCircles().some(circle => circle.id === message.payload.clientCircleId);
      const value = message.payload.value;
      const baseRadius = CIRCLE_RADIUS * Math.sqrt(value / RADIUS_RATIO);
      const clampedRadius = Math.min(baseRadius, MAX_RADIUS);

      if (!isMyCircle) {
        circleStore.addCircle({
          ...message.payload,
          radius: clampedRadius,
        });
      }
      break;
    }
    case 'CIRCLE_UPDATED': {
      const index = circleStore.getCircles().findIndex(circle => circle.id === message.payload.id);
      const value = message.payload.value;
      const baseRadius = CIRCLE_RADIUS * Math.sqrt(value / RADIUS_RATIO);
      const clampedRadius = Math.min(baseRadius, MAX_RADIUS);

      circleStore.updateCircleSize(index, clampedRadius, value);
      break;
    }
    case 'CIRCLE_DELETED': {
      const circles = message.payload;
      circles.forEach(circle => circleStore.deleteCircle(circle.id));
      break;
    }
  }
};
