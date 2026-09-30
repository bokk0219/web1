export interface Item {
  id: string;
  name: string;
  emoji: string;
  category: string;
  trackPrice: boolean;
  trackQuantity: boolean;
  reasonOptions: string[];
  createdAt: string;
}

export interface Record {
  id: string;
  itemId: string;
  date: string; // ISO date (YYYY-MM-DD)
  memo?: string;
  price?: number;
  quantity?: number;
  reason?: string;
  createdAt: string;
}

export interface AppData {
  items: Item[];
  records: Record[];
  hasVisited: boolean;
}
