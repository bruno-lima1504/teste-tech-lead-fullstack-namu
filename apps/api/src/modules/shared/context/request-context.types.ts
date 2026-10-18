import type { ClsStore } from 'nestjs-cls';

export interface RequestStore extends ClsStore {
  userId?: number;
}
