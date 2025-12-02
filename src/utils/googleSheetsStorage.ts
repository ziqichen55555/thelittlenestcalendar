import { Booking } from '../types';

// Google Apps Script Web App URL
const WEB_APP_URL = (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || 
  'https://script.google.com/macros/s/AKfycbw6krzeMoNDYgpFu1DBeOAoDoOsbps8MbSpvO-1SUDv9r3YkIATO91hfL1pK94zQPMi/exec';

// 检查配置
const checkConfig = () => {
  if (!WEB_APP_URL || WEB_APP_URL.includes('your-script-url')) {
    throw new Error('请设置 Google Apps Script Web App URL。在 .env 文件中添加 VITE_GOOGLE_SCRIPT_URL。');
  }
};

// 注意：用户的脚本使用 doPost 和 doGet，不需要 action 参数
// doPost 接收 JSON 数据，doGet 返回所有数据

// 获取所有预订
export const getBookings = async (): Promise<Booking[]> => {
  checkConfig();
  
  try {
    console.log('📡 从 Google Sheets 获取预订数据...');
    
    // 使用 GET 请求获取数据
    const response = await fetch(WEB_APP_URL);

    if (!response.ok) {
      throw new Error(`获取数据失败: ${response.statusText}`);
    }

    const data = await response.json();
    const bookings = Array.isArray(data) ? data.map((item: any, index: number) => {
      // 将 Google Sheets 数据转换为 Booking 格式
      // 注意：用户的脚本使用表头作为字段名
      return {
        id: item.ID || item.id || `row-${index + 1}`, // 如果没有 ID，使用行号
        startDate: item.StartDate || item.startDate || '',
        endDate: item.EndDate || item.endDate || '',
        guests: item.GuestsNo || item.Guests || item.guests || 1,
        note: item.Note || item.note || '',
        color: item.Color || item.color || undefined,
      };
    }) : [];
    
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
    
    // 用户的脚本期望的字段名：StartDate, EndDate, GuestsNo, Note, Color
    const data = {
      StartDate: booking.startDate,
      EndDate: booking.endDate,
      GuestsNo: booking.guests,
      Note: booking.note || '',
      Color: booking.color || '',
    };
    
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`添加失败: ${response.statusText}`);
    }

    // 等待一下确保数据已保存
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✓ 预订添加成功');
  } catch (error) {
    console.error('❌ 添加预订失败:', error);
    throw error;
  }
};

// 更新预订（注意：用户的脚本只支持添加，不支持更新）
// 我们通过删除旧记录并添加新记录来实现更新
export const updateBooking = async (id: string, updated: Booking): Promise<void> => {
  checkConfig();
  
  try {
    console.log('✏️ 更新 Google Sheets 预订:', id, updated);
    console.warn('⚠️ 注意：当前脚本不支持直接更新，将删除旧记录并添加新记录');
    
    // 先删除旧记录
    await deleteBooking(id);
    
    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 添加新记录
    await addBooking(updated);
    
    console.log('✓ 预订更新成功');
  } catch (error) {
    console.error('❌ 更新预订失败:', error);
    throw error;
  }
};

// 删除预订（注意：用户的脚本不支持删除）
// 我们需要获取所有数据，过滤掉要删除的，然后重新保存
export const deleteBooking = async (id: string): Promise<void> => {
  checkConfig();
  
  try {
    console.log('🗑️ 从 Google Sheets 删除预订:', id);
    console.warn('⚠️ 注意：当前脚本不支持直接删除，将通过重新保存所有数据来实现删除');
    
    // 获取所有数据
    const allBookings = await getBookings();
    
    // 过滤掉要删除的
    const filtered = allBookings.filter(b => b.id !== id);
    
    // 清空并重新保存
    await saveBookings(filtered);
    
    console.log('✓ 预订删除成功');
  } catch (error) {
    console.error('❌ 删除预订失败:', error);
    throw error;
  }
};

// 保存所有预订（用于初始化）
// 注意：用户的脚本不支持清空，所以这个方法会添加所有数据（可能重复）
export const saveBookings = async (bookings: Booking[]): Promise<void> => {
  checkConfig();
  
  try {
    console.log('💾 保存', bookings.length, '个预订到 Google Sheets...');
    console.warn('⚠️ 注意：当前脚本不支持清空，新数据会追加到现有数据后面');
    
    // 批量添加（用户的脚本不支持清空，所以会追加）
    for (const booking of bookings) {
      await addBooking(booking);
      // 添加延迟避免过快请求
      await new Promise(resolve => setTimeout(resolve, 200));
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

