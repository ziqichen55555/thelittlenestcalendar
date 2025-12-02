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

// 调用 Google Apps Script Web App 的 doPost
const callPostScript = async (action: string, data: any): Promise<any> => {
  checkConfig();
  
  try {
    const requestBody = { action, ...data };
    console.log(`🚀 调用 Google Script doPost (action: ${action})`, requestBody);
    
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('doPost 响应状态:', response.status, response.statusText);
    console.log('doPost 响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text().catch(() => '无法读取错误信息');
      console.error('doPost 响应错误:', errorText);
      throw new Error(`操作失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // 尝试解析 JSON 响应
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('doPost 响应数据:', result);
      return result;
    } else {
      // 如果不是 JSON，尝试读取文本
      const text = await response.text();
      console.log('doPost 响应文本:', text);
      return { status: 'success', message: text };
    }
  } catch (error) {
    console.error('❌ 调用 Google Script doPost 失败:', error);
    
    // 检查是否是 CORS 错误
    if (error instanceof TypeError) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('cors') || errorMessage.includes('preflight') || errorMessage.includes('load failed')) {
        throw new Error('CORS 错误：Google Apps Script 需要添加 doOptions 函数来处理 CORS 预检请求。\n\n请查看 修复CORS错误.md 文件了解如何修复。\n\n或者，你可以：\n1. 打开 Google Apps Script\n2. 添加 doOptions 函数（见 修复CORS错误.md）\n3. 重新部署 Web App');
      }
      if (errorMessage.includes('fetch')) {
        throw new Error('网络请求失败。请检查：\n1. 网络连接是否正常\n2. Google Apps Script Web App URL 是否正确\n3. Web App 是否已正确部署');
      }
    }
    
    throw error;
  }
};

// 获取所有预订
export const getBookings = async (): Promise<Booking[]> => {
  checkConfig();
  
  try {
    console.log('📡 从 Google Sheets 获取预订数据...');
    console.log('请求 URL:', WEB_APP_URL);
    
    // 使用 GET 请求获取数据
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
    console.log('获取到的原始数据:', data);
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
      ID: booking.id, // 确保 ID 也传递过去
      StartDate: booking.startDate,
      EndDate: booking.endDate,
      GuestsNo: booking.guests,
      Note: booking.note || '',
      Color: booking.color || '',
    };
    
    await callPostScript('add', data);
    
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
    
    // 用户的脚本期望的字段名：StartDate, EndDate, GuestsNo, Note, Color
    const data = {
      ID: id, // 确保 ID 也传递过去
      StartDate: updated.startDate,
      EndDate: updated.endDate,
      GuestsNo: updated.guests,
      Note: updated.note || '',
      Color: updated.color || '',
    };
    
    await callPostScript('update', data);
    
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
    
    // 根据推荐的脚本，delete action 期望 data.id（小写）
    // 同时传递 id 和 ID 以兼容不同格式
    await callPostScript('delete', { id: id, ID: id });
    
    // 等待一下确保数据已保存
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✓ 预订删除成功');
  } catch (error) {
    console.error('❌ 删除预订失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    // 提供更详细的错误信息
    if (errorMessage.includes('Load failed') || errorMessage.includes('Failed to fetch')) {
      throw new Error('网络连接失败。请检查：\n1. 网络连接是否正常\n2. Google Apps Script 是否支持 delete action\n3. 查看浏览器控制台获取详细错误信息');
    }
    
    throw error;
  }
};

// 保存所有预订（用于初始化）
export const saveBookings = async (bookings: Booking[]): Promise<void> => {
  checkConfig();
  
  try {
    console.log('💾 保存', bookings.length, '个预订到 Google Sheets...');
    
    // 先清空所有数据
    await callPostScript('clearAll', {});
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 批量添加
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

