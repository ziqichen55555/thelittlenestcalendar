import { Booking } from '../types';

// Google Apps Script Web App URL
// 注意：使用 /exec 版本（生产版本），不是 /dev 版本
const WEB_APP_URL = (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || 
  'https://script.google.com/macros/s/AKfycbz6aY83vkEBpdpO8EJOWaA4HWob6p7vnc-wyoL0Dlbd_WH5sRdeeCn7qjVsSMpro2vk/exec';

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
        throw new Error('CORS 错误：POST 请求失败，说明 doOptions 函数可能未正确部署。\n\n📖 立即执行以下步骤：\n1. 打开 Google Apps Script: https://script.google.com/\n2. 确认代码中有 doOptions 函数（在文件顶部）\n3. 点击"部署" → "管理部署" → "编辑"\n4. 在"版本"下拉菜单中选择"新版本"（不要选择"Head"）\n5. 确认"具有访问权限的用户" = "所有人"\n6. 点击"部署"\n7. 等待 10-20 秒后重试\n\n💡 详细步骤请查看：立即执行-复制代码步骤.md 或 紧急修复-CORS405错误.md\n\n🔍 也可以使用测试工具：https://ziqichen55555.github.io/thelittlenestcalendar/测试OPTIONS请求.html');
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
    
    // 检查是否有旧的 localStorage 数据
    const oldStorageKey = 'room-bookings';
    const oldData = localStorage.getItem(oldStorageKey);
    if (oldData) {
      console.warn('⚠️ 发现旧的 localStorage 数据！');
      console.warn('📍 localStorage 数据:', oldData);
      console.warn('💡 提示：这些数据不会显示，因为现在使用 Google Sheets。');
      console.warn('💡 如果想清理，可以在浏览器控制台运行：localStorage.removeItem("room-bookings")');
    }
    
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
    console.log('📊 获取到的原始数据（来自 Google Sheets）:', data);
    console.log('📊 数据类型:', Array.isArray(data) ? '数组' : typeof data);
    console.log('📊 数据长度:', Array.isArray(data) ? data.length : 'N/A');
    
    // 检查是否有错误
    if (data && typeof data === 'object' && 'error' in data) {
      const errorMsg = data.error;
      console.error('❌ Google Sheets 错误:', errorMsg);
      
      if (errorMsg === 'Sheet not found') {
        throw new Error('工作表未找到：请在 Google Sheet 中创建名为 "thelittlenestbookings" 的工作表。\n\n详细步骤请查看：创建thelittlenestbookings工作表-详细步骤.md');
      } else {
        throw new Error(`Google Sheets 错误: ${errorMsg}`);
      }
    }
    
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
    
    console.log('✓ 成功获取', bookings.length, '个预订（来自 Google Sheets）');
    if (bookings.length > 0) {
      console.log('📋 预订列表:');
      bookings.forEach((booking, index) => {
        console.log(`  ${index + 1}. ID: ${booking.id}, ${booking.startDate} - ${booking.endDate} (${booking.guests}人) - ${booking.note || '无备注'}`);
      });
    } else {
      console.log('ℹ️ Google Sheets 中目前没有预订数据');
    }
    
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

// 诊断 Google Sheet 连接状态
export const diagnoseGoogleSheet = async (): Promise<{
  success: boolean;
  url: string;
  status: number;
  data: any;
  error?: string;
  sheetExists: boolean;
  hasData: boolean;
  recordCount: number;
}> => {
  checkConfig();
  
  const result = {
    success: false,
    url: WEB_APP_URL,
    status: 0,
    data: null as any,
    error: undefined as string | undefined,
    sheetExists: false,
    hasData: false,
    recordCount: 0,
  };
  
  try {
    console.log('🔍 开始诊断 Google Sheet 连接...');
    console.log('📍 Web App URL:', WEB_APP_URL);
    
    const response = await fetch(WEB_APP_URL, {
      method: 'GET',
    });
    
    result.status = response.status;
    console.log('📊 响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '无法读取错误信息');
      result.error = `HTTP ${response.status}: ${errorText}`;
      console.error('❌ HTTP 错误:', result.error);
      return result;
    }
    
    const data = await response.json();
    result.data = data;
    console.log('📊 返回的数据:', data);
    
    // 检查是否有错误
    if (data && typeof data === 'object' && 'error' in data) {
      result.error = data.error;
      result.sheetExists = data.error !== 'Sheet not found';
      console.error('❌ Google Sheets 错误:', result.error);
      return result;
    }
    
    // 检查是否是数组（正常情况）
    if (Array.isArray(data)) {
      result.success = true;
      result.sheetExists = true;
      result.recordCount = data.length;
      result.hasData = data.length > 0;
      console.log('✓ 诊断成功：工作表存在，有', data.length, '条记录');
      
      if (data.length > 0) {
        console.log('📋 前 3 条记录:');
        data.slice(0, 3).forEach((item, index) => {
          console.log(`  ${index + 1}.`, item);
        });
      }
    } else {
      result.error = '返回的数据格式不正确，期望数组但得到: ' + typeof data;
      console.error('❌ 数据格式错误:', result.error);
    }
    
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    console.error('❌ 诊断失败:', result.error);
    return result;
  }
};

