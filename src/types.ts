export interface Booking {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  guests: number;
  note: string;
  color?: 'green'; // 特殊標記顏色
}

