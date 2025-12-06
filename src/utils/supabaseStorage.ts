import { Booking } from '../types';

// Supabase 配置
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 
  'https://ivsokmmynbxguukzukvv.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// 检查配置
const checkConfig = () => {
  if (!SUPABASE_URL || SUPABASE_URL.includes('your-supabase-url')) {
    throw new Error('请设置 Supabase URL。在 .env 文件中添加 VITE_SUPABASE_URL。');
  }
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('your-anon-key')) {
    throw new Error('请设置 Supabase Anon Key。在 .env 文件中添加 VITE_SUPABASE_ANON_KEY。');
  }
};

// 调用 Supabase REST API
const callSupabase = async (method: string, endpoint: string, data?: any): Promise<any> => {
  checkConfig();
  
  try {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=representation',
    };
    
    const options: RequestInit = {
      method,
      headers,
    };
    
    if (data && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    console.log(`🚀 调用 Supabase ${method} ${endpoint}`, data);
    
    const response = await fetch(url, options);
    
    console.log('响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '无法读取错误信息');
      console.error('响应错误:', errorText);
      throw new Error(`操作失败: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    // 对于 DELETE 请求，可能没有响应体
    if (method === 'DELETE' && response.status === 204) {
      return { status: 'success' };
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
    console.error(`❌ 调用 Supabase ${method} 失败:`, error);
    throw error;
  }
};

// 获取所有预订
export const getBookings = async (): Promise<Booking[]> => {
  checkConfig();
  
  try {
    console.log('📡 从 Supabase 获取预订数据...');
    
    const data = await callSupabase('GET', 'bookings?order=startDate.asc');
    
    const bookings = Array.isArray(data) ? data.map((item: any) => {
      return {
        id: item.id || item.ID || String(item.id),
        startDate: item.startDate || item.start_date || '',
        endDate: item.endDate || item.end_date || '',
        guests: item.guests || item.guestsNo || item.guests_no || 1,
        note: item.note || '',
        color: item.color || undefined,
      };
    }) : [];
    
    console.log('✓ 成功获取', bookings.length, '个预订（来自 Supabase）');
    if (bookings.length > 0) {
      console.log('📋 预订列表:');
      bookings.forEach((booking, index) => {
        console.log(`  ${index + 1}. ID: ${booking.id}, ${booking.startDate} - ${booking.endDate} (${booking.guests}人) - ${booking.note || '无备注'}`);
      });
    } else {
      console.log('ℹ️ Supabase 中目前没有预订数据');
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
    console.log('➕ 添加预订到 Supabase:', booking);
    
    const data = {
      id: booking.id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      guests: booking.guests,
      note: booking.note || '',
      color: booking.color || null,
    };
    
    await callSupabase('POST', 'bookings', data);
    
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
    console.log('✏️ 更新 Supabase 预订:', id, updated);
    
    const data = {
      startDate: updated.startDate,
      endDate: updated.endDate,
      guests: updated.guests,
      note: updated.note || '',
      color: updated.color || null,
    };
    
    await callSupabase('PATCH', `bookings?id=eq.${id}`, data);
    
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
    console.log('🗑️ 从 Supabase 删除预订:', id);
    
    await callSupabase('DELETE', `bookings?id=eq.${id}`);
    
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
    console.log('💾 保存', bookings.length, '个预订到 Supabase...');
    
    // 先清空所有数据
    await callSupabase('DELETE', 'bookings');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 批量添加
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
  console.log('👂 开始监听 Supabase 数据变化...');
  
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

// 诊断 Supabase 连接状态
export const diagnoseSupabase = async () => {
  const result = {
    url: SUPABASE_URL,
    apiAccessible: false,
    tableExists: false,
    recordCount: 0,
    firstRecord: null as any,
    error: null as string | null,
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    result.apiAccessible = response.ok;

    if (!response.ok) {
      const errorText = await response.text().catch(() => '无法读取错误信息');
      result.error = `API 请求失败: ${response.status} ${response.statusText} - ${errorText}`;
      
      if (response.status === 404) {
        result.error += '\n\n💡 可能的原因：表 "bookings" 不存在。请在 Supabase 中创建表。';
      } else if (response.status === 401) {
        result.error += '\n\n💡 可能的原因：Supabase Anon Key 不正确或未设置。';
      }
      
      return result;
    }

    const data = await response.json();
    result.tableExists = true;
    
    if (Array.isArray(data)) {
      result.recordCount = data.length;
      if (data.length > 0) {
        result.firstRecord = data[0];
      }
    } else {
      result.error = 'API 返回数据格式不正确，期望数组。';
    }

  } catch (err: any) {
    result.error = `网络或配置错误: ${err.message || String(err)}`;
    if (err instanceof TypeError && err.message.includes('fetch')) {
      result.error += '\n\n💡 可能的原因：网络连接问题或 Supabase URL 不正确。';
    }
  }
  
  return result;
};

