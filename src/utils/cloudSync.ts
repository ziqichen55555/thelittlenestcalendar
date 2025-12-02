import { Booking } from '../types';

// 使用一个简单的云存储服务（基于 JSONBin.io 的免费 API）
// 或者使用 GitHub Gist（需要 token）
// 这里提供一个简单的实现，使用 localStorage + 导出/导入功能

const SYNC_KEY = 'booking-sync-id';

// 生成一个唯一的同步 ID
export const getSyncId = (): string => {
  let syncId = localStorage.getItem(SYNC_KEY);
  if (!syncId) {
    syncId = 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(SYNC_KEY, syncId);
  }
  return syncId;
};

// 导出数据为 JSON 字符串
export const exportBookings = (bookings: Booking[]): string => {
  return JSON.stringify(bookings, null, 2);
};

// 从 JSON 字符串导入数据
export const importBookings = (jsonString: string): Booking[] | null => {
  try {
    const bookings = JSON.parse(jsonString);
    if (Array.isArray(bookings)) {
      return bookings;
    }
    return null;
  } catch (error) {
    console.error('导入数据失败:', error);
    return null;
  }
};

// 下载数据为文件
export const downloadBookings = (bookings: Booking[]): void => {
  const json = exportBookings(bookings);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bookings-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 从文件读取数据
export const readBookingsFromFile = (file: File): Promise<Booking[] | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const bookings = importBookings(text);
      resolve(bookings);
    };
    reader.onerror = () => {
      resolve(null);
    };
    reader.readAsText(file);
  });
};

