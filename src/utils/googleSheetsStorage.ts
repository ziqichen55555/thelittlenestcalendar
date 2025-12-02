import { Booking } from '../types';

// Google Apps Script Web App URL
const WEB_APP_URL = (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || 
  'https://script.google.com/macros/s/AKfycbwP9l0erfmQ7rLU8BH-szu0OQyvGOgAklnq4f6lHcM5tVg5IbewWqO-FFBrzebbN93O/exec';

// 检查配置
const checkConfig = () => {
  if (!WEB_APP_URL || WEB_APP_URL.includes('your-script-url')) {
    throw new Error('请设置 Google Apps Script Web App URL。在 .env 文件中添加 VITE_GOOGLE_SCRIPT_URL。');
  }
};

// 调用 Google Apps Script Web App
const callScript = async (action: string, data?: any): Promise<any> => {
  checkConfig();
  
  try {
    // 使用 URL 参数方式发送数据（更兼容）
    const params = new URLSearchParams({
      action,
      ...(data ? { data: JSON.stringify(data) } : {}),
    });
    
    const url = `${WEB_APP_URL}?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`操作失败: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('调用 Google Script 失败:', error);
    throw error;
  }
};

// 获取所有预订
export const getBookings = async (): Promise<Booking[]> => {
  checkConfig();
  
  try {
    console.log('📡 从 Google Sheets 获取预订数据...');
    
    // 使用 GET 请求获取数据
    const url = `${WEB_APP_URL}?action=getAll`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`获取数据失败: ${response.statusText}`);
    }

    const data = await response.json();
    const bookings = Array.isArray(data) ? data : [];
    
    console.log('✓ 成功获取', bookings.length, '个预订');
    return bookings;
  } catch (error) {
    console.error('❌ 获取预订失败:', error);
    throw error;
  }
};

// 添加预订
export const addBooking = async (booking: Booking): Promise<void> => {
  checkConfig();
  
  try {
    console.log('➕ 添加预订到 Google Sheets:', booking);
    
    await callScript('add', booking);
    
    // 等待一下确保数据已保存
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✓ 预订添加成功');
  } catch (error) {
    console.error('❌ 添加预订失败:', error);
    throw error;
  }
};

// 更新预订
export const updateBooking = async (id: string, updated: Booking): Promise<void> => {
  checkConfig();
  
  try {
    console.log('✏️ 更新 Google Sheets 预订:', id, updated);
    
    await callScript('update', { ...updated, id });
    
    // 等待一下确保数据已保存
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✓ 预订更新成功');
  } catch (error) {
    console.error('❌ 更新预订失败:', error);
    throw error;
  }
};

// 删除预订
export const deleteBooking = async (id: string): Promise<void> => {
  checkConfig();
  
  try {
    console.log('🗑️ 从 Google Sheets 删除预订:', id);
    
    await callScript('delete', { id });
    
    // 等待一下确保数据已保存
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✓ 预订删除成功');
  } catch (error) {
    console.error('❌ 删除预订失败:', error);
    throw error;
  }
};

// 保存所有预订（用于初始化）
export const saveBookings = async (bookings: Booking[]): Promise<void> => {
  checkConfig();
  
  try {
    console.log('💾 保存', bookings.length, '个预订到 Google Sheets...');
    
    // 先清空所有数据
    await callScript('clearAll');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 批量添加
    for (const booking of bookings) {
      await addBooking(booking);
    }
    
    console.log('✓ 所有预订保存成功');
  } catch (error) {
    console.error('❌ 保存预订失败:', error);
    throw error;
  }
};

// 监听预订变化（使用轮询）
export const subscribeToBookings = (
  callback: (bookings: Booking[]) => void
): (() => void) => {
  console.log('👂 开始监听 Google Sheets 数据变化...');
  
  let lastData = '';
  let intervalId: number;
  
  const checkForUpdates = async () => {
    try {
      const bookings = await getBookings();
      const currentData = JSON.stringify(bookings);
      
      if (currentData !== lastData) {
        lastData = currentData;
        console.log('🔄 数据更新:', bookings.length, '个预订');
        callback(bookings);
      }
    } catch (error) {
      console.error('检查更新失败:', error);
    }
  };
  
  // 立即检查一次
  checkForUpdates();
  
  // 每 5 秒检查一次更新
  intervalId = window.setInterval(checkForUpdates, 5000);
  
  return () => {
    console.log('🔌 停止监听');
    clearInterval(intervalId);
  };
};

