import type { User } from './user.ts';

export type Cursor = {
  id: string;
  x: number;
  y: number;
  color: User['color'];
};
