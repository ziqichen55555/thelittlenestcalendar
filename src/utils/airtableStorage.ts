import { Booking } from '../types';

// Airtable 配置
const AIRTABLE_BASE_ID = (import.meta as any).env?.VITE_AIRTABLE_BASE_ID || '';
const AIRTABLE_API_KEY = (import.meta as any).env?.VITE_AIRTABLE_API_KEY || '';
const AIRTABLE_TABLE_NAME = 'Bookings';

// 检查配置
const checkConfig = () => {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
    throw new Error('请设置 Airtable 配置。在 .env 文件中添加 VITE_AIRTABLE_BASE_ID 和 VITE_AIRTABLE_API_KEY。查看 AIRTABLE_SETUP.md 了解详细步骤。');
  }
};

// 将 Airtable 记录转换为 Booking
const recordToBooking = (record: any): Booking => {
  return {
    id: record.id,
    startDate: record.fields.StartDate || '',
    endDate: record.fields.EndDate || '',
    guests: record.fields.Guests || 1,
    note: record.fields.Note || '',
    color: record.fields.Color || undefined,
  };
};

// 将 Booking 转换为 Airtable 字段
const bookingToFields = (booking: Booking) => {
  return {
    StartDate: booking.startDate,
    EndDate: booking.endDate,
    Guests: booking.guests,
    Note: booking.note || '',
    Color: booking.color || null,
  };
};

// 获取所有预订
export const getBookings = async (): Promise<Booking[]> => {
  checkConfig();
  
  try {
    console.log('📡 从 Airtable 获取预订数据...');
    
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?sort%5B0%5D%5Bfield%5D=StartDate&sort%5B0%5D%5Bdirection%5D=asc`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`获取数据失败: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const bookings = data.records.map(recordToBooking);
    
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
    console.log('➕ 添加预订到 Airtable:', booking);
    
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: bookingToFields(booking),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`添加失败: ${error.error?.message || response.statusText}`);
    }

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
    console.log('✏️ 更新 Airtable 预订:', id, updated);
    
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: bookingToFields(updated),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`更新失败: ${error.error?.message || response.statusText}`);
    }

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
    console.log('🗑️ 从 Airtable 删除预订:', id);
    
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`删除失败: ${error.error?.message || response.statusText}`);
    }

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
    console.log('💾 保存', bookings.length, '个预订到 Airtable...');
    
    // 先获取现有数据
    const existing = await getBookings();
    
    // 删除所有现有数据
    for (const booking of existing) {
      await deleteBooking(booking.id);
    }
    
    // 批量添加新数据（Airtable 支持批量操作）
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    // 每次最多 10 条记录
    const batchSize = 10;
    for (let i = 0; i < bookings.length; i += batchSize) {
      const batch = bookings.slice(i, i + batchSize);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: batch.map(booking => ({
            fields: bookingToFields(booking),
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`批量保存失败: ${error.error?.message || response.statusText}`);
      }
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
  console.log('👂 开始监听 Airtable 数据变化...');
  
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

