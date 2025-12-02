import { Booking } from '../types';

// GitHub Gist 配置
// 使用 GitHub Gist 作为免费云端存储
const GIST_ID = 'your-gist-id'; // 第一次运行后会自动创建
const GIST_FILENAME = 'bookings.json';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

// 获取或创建 Gist
const getOrCreateGist = async (): Promise<string> => {
  if (!GITHUB_TOKEN) {
    throw new Error('请设置 GitHub Token。在项目根目录创建 .env 文件，添加：VITE_GITHUB_TOKEN=你的token');
  }

  // 如果已有 Gist ID，直接返回
  const savedGistId = localStorage.getItem('gist-id');
  if (savedGistId && savedGistId !== 'your-gist-id') {
    return savedGistId;
  }

  // 创建新的 Gist
  try {
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'The Little Nest Calendar - Bookings Data',
        public: false, // 私有 Gist
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify([], null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`创建 Gist 失败: ${error.message}`);
    }

    const data = await response.json();
    localStorage.setItem('gist-id', data.id);
    console.log('✓ 创建新的 Gist:', data.id);
    return data.id;
  } catch (error) {
    console.error('创建 Gist 失败:', error);
    throw error;
  }
};

// 获取所有预订
export const getBookings = async (): Promise<Booking[]> => {
  try {
    console.log('📡 从 GitHub Gist 获取预订数据...');
    
    const gistId = await getOrCreateGist();
    
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
      }
    });

    if (!response.ok) {
      throw new Error(`获取数据失败: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.files[GIST_FILENAME]?.content || '[]';
    const bookings = JSON.parse(content);
    
    console.log('✓ 成功获取', bookings.length, '个预订');
    return bookings;
  } catch (error) {
    console.error('❌ 获取预订失败:', error);
    throw error;
  }
};

// 保存所有预订
export const saveBookings = async (bookings: Booking[]): Promise<void> => {
  try {
    console.log('💾 保存', bookings.length, '个预订到 GitHub Gist...');
    
    const gistId = await getOrCreateGist();
    
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(bookings, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`保存失败: ${error.message}`);
    }

    console.log('✓ 预订保存成功');
  } catch (error) {
    console.error('❌ 保存预订失败:', error);
    throw error;
  }
};

// 添加预订
export const addBooking = async (booking: Booking): Promise<void> => {
  const bookings = await getBookings();
  bookings.push(booking);
  await saveBookings(bookings);
};

// 更新预订
export const updateBooking = async (id: string, updated: Booking): Promise<void> => {
  const bookings = await getBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    bookings[index] = updated;
    await saveBookings(bookings);
  }
};

// 删除预订
export const deleteBooking = async (id: string): Promise<void> => {
  const bookings = await getBookings();
  const filtered = bookings.filter(b => b.id !== id);
  await saveBookings(filtered);
};

// 监听预订变化（使用轮询方式）
export const subscribeToBookings = (
  callback: (bookings: Booking[]) => void
): (() => void) => {
  console.log('👂 开始监听 GitHub Gist 数据变化...');
  
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

