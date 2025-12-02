import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

interface Database {
  products: Product[];
  disputes: Dispute[];
  notifications: Notification[];
  arbitrations: Arbitration[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  seller: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dispute {
  id: string;
  orderId: number;
  buyer: string;
  seller: string;
  reason: string;
  status: 'open' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'order_created' | 'order_accepted' | 'order_shipped' | 'dispute_opened' | 'dispute_resolved';
  message: string;
  read: boolean;
  createdAt: string;
  orderId?: number;
}

export interface Arbitration {
  id: string;
  orderId: number;
  arbitrator: string;
  winner: string;
  reason: string;
  createdAt: string;
}

const file = join(__dirname, '../../data/db.json');

const adapter = new JSONFile<Database>(file);
const defaultData: Database = {
  products: [],
  disputes: [],
  notifications: [],
  arbitrations: []
};

export const db = new Low(adapter, defaultData);

export async function initDatabase() {
  await db.read();
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  }
}
