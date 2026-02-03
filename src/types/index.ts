import type { Timestamp } from 'firebase/firestore';

export interface VakiItem {
  id: string;
  name: string;
  addedBy: string;
  bought: boolean;
  boughtBy?: string;
  createdAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
}
