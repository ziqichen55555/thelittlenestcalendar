// ============================================
// 使用 GET 请求的替代方案（避免 CORS 预检）
// ============================================
// 这个版本使用 GET 请求的查询参数传递数据，避免触发 CORS 预检

import { Booking } from '../types';

// Google Apps Script Web App URL
const WEB_APP_URL = (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || 
  'https://script.google.com/macros/s/AKfycbz6aY83vkEBpdpO8EJOWaA4HWob6p7vnc-wyoL0Dlbd_WH5sRdeeCn7qjVsSMpro2vk/exec';

// 检查配置
const checkConfig = () => {
  if (!WEB_APP_URL || WEB_APP_URL.includes('your-script-url')) {
    throw new Error('请设置 Google Apps Script Web App URL。在 .env 文件中添加 VITE_GOOGLE_SCRIPT_URL。');
  }
};

// 使用 GET 请求调用 Google Apps Script
const callGetScript = async (action: string, data: any): Promise<any> => {
  checkConfig();
  
  try {
    // 将数据编码为 URL 查询参数
    const params = new URLSearchParams({
      action: action,
      ...Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      )
    });
    
    const url = `${WEB_APP_URL}?${params.toString()}`;
    console.log(`🚀 调用 Google Script (GET, action: ${action})`, url);
    
    const response = await fetch(url, {
      method: 'GET',
    });

    console.log('响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '无法读取错误信息');
      console.error('响应错误:', errorText);
      throw new Error(`操作失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('响应数据:', result);
      return result;
    } else {
      const text = await response.text();
      console.log('响应文本:', text);
      return { status: 'success', message: text };
    }
  } catch (error) {
    console.error('❌ 调用 Google Script 失败:', error);
    throw error;
  }
};

// 获取所有预订
export const getBookings = async (): Promise<Booking[]> => {
  checkConfig();
  
  try {
    console.log('📡 从 Google Sheets 获取预订数据...');
    
    const response = await fetch(WEB_APP_URL, {
      method: 'GET',
    });

    console.log('响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '无法读取错误信息');
      console.error('响应错误:', errorText);
      throw new Error(`获取数据失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 获取到的原始数据（来自 Google Sheets）:', data);

    if (data && typeof data === 'object' && 'error' in data) {
      const errorMsg = data.error;
      console.error('❌ Google Sheets 错误:', errorMsg);
      
      if (errorMsg === 'Sheet not found') {
        throw new Error('工作表未找到：请在 Google Sheet 中创建名为 "thelittlenestbookings" 的工作表。');
      } else {
        throw new Error(`Google Sheets 错误: ${errorMsg}`);
      }
    }
    
    const bookings = Array.isArray(data) ? data.map((item: any, index: number) => {
      return {
        id: item.ID || item.id || `row-${index + 1}`,
        startDate: item.StartDate || item.startDate || '',
        endDate: item.EndDate || item.endDate || '',
        guests: item.GuestsNo || item.Guests || item.guests || 1,
        note: item.Note || item.note || '',
        color: item.Color || item.color || undefined,
      };
    }) : [];
    
    console.log('✓ 成功获取', bookings.length, '个预订（来自 Google Sheets）');
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
    
    const data = {
      ID: booking.id,
      StartDate: booking.startDate,
      EndDate: booking.endDate,
      GuestsNo: booking.guests,
      Note: booking.note || '',
      Color: booking.color || '',
    };
    
    await callGetScript('add', data);
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
    
    const data = {
      ID: id,
      StartDate: updated.startDate,
      EndDate: updated.endDate,
      GuestsNo: updated.guests,
      Note: updated.note || '',
      Color: updated.color || '',
    };
    
    await callGetScript('update', data);
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
    
    await callGetScript('delete', { id: id, ID: id });
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
    
    await callGetScript('clearAll', {});
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (const booking of bookings) {
      await addBooking(booking);
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
  
  checkForUpdates();
  intervalId = window.setInterval(checkForUpdates, 5000);
  
  return () => {
    console.log('🔌 停止监听');
    clearInterval(intervalId);
  };
};

// 诊断 Google Sheet 连接状态
export const diagnoseGoogleSheet = async () => {
  const result = {
    url: WEB_APP_URL,
    apiAccessible: false,
    sheetExists: false,
    recordCount: 0,
    firstRecord: null as any,
    error: null as string | null,
  };

  try {
    const response = await fetch(WEB_APP_URL, { method: 'GET' });
    result.apiAccessible = response.ok;

    if (!response.ok) {
      result.error = `API 请求失败: ${response.status} ${response.statusText}`;
      return result;
    }

    const data = await response.json();

    if (data && data.error) {
      result.error = data.error;
      if (data.error.includes('Sheet not found')) {
        result.sheetExists = false;
      }
      return result;
    }

    result.sheetExists = true;
    if (Array.isArray(data)) {
      result.recordCount = data.length;
      if (data.length > 0) {
        result.firstRecord = data[0];
      }
    } else {
      result.error = 'API 返回数据格式不正确，期望数组。';
    }

  } catch (err: any) {
    result.error = `网络或 CORS 错误: ${err.message || String(err)}`;
  }
  return result;
};

