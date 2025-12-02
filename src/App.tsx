import { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import { Booking } from './types';
import { 
  getBookings, 
  addBooking, 
  updateBooking, 
  deleteBooking, 
  saveBookings,
  subscribeToBookings 
} from './utils/googleSheetsStorage';

function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('=== App 组件加载 ===');
    console.log('当前环境:', {
      href: window.location.href,
      pathname: window.location.pathname,
      origin: window.location.origin,
    });
    console.log('=== App: 连接 Google Sheets 云端存储 ===');
    
    // 检查 Google Script URL
    const scriptUrl = (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || 
      'https://script.google.com/macros/s/AKfycbwP9l0erfmQ7rLU8BH-szu0OQyvGOgAklnq4f6lHcM5tVg5IbewWqO-FFBrzebbN93O/exec';
    
    if (!scriptUrl || scriptUrl.includes('your-script-url')) {
      console.error('❌ Google Script URL 未设置！');
      setError('⚠️ 请设置 Google Apps Script Web App URL。在项目根目录创建 .env 文件，添加 VITE_GOOGLE_SCRIPT_URL。查看 GOOGLE_SHEETS_SETUP.md 了解详细步骤。');
      setIsLoading(false);
      return;
    }
    
    // 设置实时监听，自动同步云端数据
    const unsubscribe = subscribeToBookings((bookings) => {
      console.log('📥 收到云端数据更新:', bookings.length, '个预订');
      console.log('📊 当前所有预订数据:', bookings);
      setBookings(bookings);
      setIsLoading(false);
      setError(null);
    });
    
    // 初始化：检查是否有数据
    setIsLoading(true);
    
    // 先检查是否有本地存储的数据
    const checkLocalStorage = () => {
      try {
        const stored = localStorage.getItem('room-bookings');
        if (stored) {
          const localBookings: Booking[] = JSON.parse(stored);
          if (localBookings.length > 0) {
            console.log('📦 发现本地存储数据:', localBookings.length, '个预订');
            return localBookings;
          }
        }
      } catch (error) {
        console.error('读取本地存储失败:', error);
      }
      return null;
    };
    
    const localBookings = checkLocalStorage();
    
    getBookings()
      .then((existingBookings) => {
        setIsLoading(false);
        if (existingBookings.length === 0) {
          console.log('没有云端数据');
          if (localBookings && localBookings.length > 0) {
            setError(`数据库为空，但发现 ${localBookings.length} 个本地预订。请点击"从本地导入"按钮将数据迁移到云端。`);
          } else {
            setError('数据库为空，请点击"初始化数据"按钮添加示例预订');
          }
        } else {
          console.log('✓ 已有云端数据，数量:', existingBookings.length);
          console.log('📊 当前所有预订数据:', existingBookings);
          console.log('📋 预订详情:');
          existingBookings.forEach((booking, index) => {
            console.log(`  ${index + 1}. ${booking.startDate} - ${booking.endDate} (${booking.guests}人) - ${booking.note || '无备注'}`);
          });
          setError(null);
        }
      })
      .catch((error) => {
        console.error('❌ 加载云端数据失败:', error);
        setIsLoading(false);
        if (localBookings && localBookings.length > 0) {
          setError(`连接数据库失败，但发现 ${localBookings.length} 个本地预订。请点击"从本地导入"按钮将数据迁移到云端。`);
        } else {
          setError(`连接数据库失败: ${error instanceof Error ? error.message : '未知错误'}. 请检查 Firebase 配置。`);
        }
      });
    
    // 清理函数：取消监听
    return () => {
      console.log('🔌 断开云端连接');
      unsubscribe();
    };
  }, []);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setEditingBooking(null);
    setShowForm(true);
  };

  const handleSaveBooking = async (booking: Booking) => {
    try {
      if (editingBooking) {
        await updateBooking(booking.id, booking);
        console.log('✓ 预订更新成功');
        alert('✓ 预订已更新并保存到云端！');
      } else {
        await addBooking(booking);
        console.log('✓ 预订添加成功');
        alert('✓ 预订已添加并保存到云端！');
      }
      // 数据会自动通过实时监听更新，不需要手动刷新
      setShowForm(false);
      setEditingBooking(null);
      setSelectedDate('');
    } catch (error) {
      console.error('❌ 保存预订失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`❌ 保存失败: ${errorMessage}\n\n如果看到 "Firebase 未配置" 错误，请查看 FIREBASE_SETUP.md 文件配置 Firebase。`);
      setError(errorMessage);
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setSelectedDate(booking.startDate);
    setShowForm(true);
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm('確定要刪除這個預訂嗎？')) {
      try {
        await deleteBooking(id);
        console.log('✓ 预订删除成功');
        // 数据会自动通过实时监听更新
      } catch (error) {
        console.error('❌ 删除预订失败:', error);
        alert('删除失败，请检查网络连接或稍后重试');
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBooking(null);
    setSelectedDate('');
  };

  // 从 localStorage 导入数据
  const handleImportFromLocalStorage = async () => {
    try {
      const stored = localStorage.getItem('room-bookings');
      if (!stored) {
        alert('本地存储中没有找到数据');
        return;
      }
      
      const localBookings: Booking[] = JSON.parse(stored);
      if (localBookings.length === 0) {
        alert('本地存储中没有预订数据');
        return;
      }
      
      if (!confirm(`找到 ${localBookings.length} 个本地预订，是否导入到云端？`)) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      await saveBookings(localBookings);
      console.log('✓ 本地数据导入成功');
      alert(`成功导入 ${localBookings.length} 个预订到云端！`);
      
      // 清除本地存储
      localStorage.removeItem('room-bookings');
    } catch (error) {
      console.error('❌ 导入数据失败:', error);
      setError(`导入失敗: ${error instanceof Error ? error.message : '未知错误'}`);
      alert('导入失敗，請檢查網絡連接');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeData = async () => {
    if (!confirm('確定要初始化數據嗎？這將添加 5 個示例預訂。')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const initialBookings: Booking[] = [
        {
          id: '1',
          startDate: '2025-12-03',
          endDate: '2025-12-06',
          guests: 1,
          note: 'Anthony 一个人 男',
        },
        {
          id: '2',
          startDate: '2025-12-06',
          endDate: '2025-12-07',
          guests: 2,
          note: 'fangfang 跟另外一个人住',
          color: 'green',
        },
        {
          id: '3',
          startDate: '2026-01-11',
          endDate: '2026-01-23',
          guests: 1,
          note: 'auxence',
        },
        {
          id: '4',
          startDate: '2026-01-26',
          endDate: '2026-02-09',
          guests: 1,
          note: 'Sarah 巴黎',
        },
        {
          id: '5',
          startDate: '2026-02-10',
          endDate: '2026-02-11',
          guests: 2,
          note: '法国情侣',
          color: 'green',
        },
      ];
      
      await saveBookings(initialBookings);
      console.log('✓ 初始数据保存成功');
      alert('數據初始化成功！');
    } catch (error) {
      console.error('❌ 保存初始数据失败:', error);
      setError(`初始化失敗: ${error instanceof Error ? error.message : '未知错误'}`);
      alert('初始化失敗，請檢查 Firebase 配置或網絡連接');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏠 the little nest calendar</h1>
        <p>fangfang and chris</p>
        <div style={{ 
          marginTop: '10px', 
          fontSize: '14px', 
          color: '#666',
          fontWeight: 'normal' 
        }}>
          当前共有 <strong style={{ color: '#667eea' }}>{bookings.length}</strong> 个预订
        </div>
        {error && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#c33'
          }}>
            ⚠️ {error}
          </div>
        )}
        {isLoading && (
          <div style={{
            marginTop: '10px',
            fontSize: '13px',
            color: '#666'
          }}>
            🔄 正在加载数据...
          </div>
        )}
      </header>
      
      <main className="app-main">
        <div className="calendar-section">
          <Calendar
            bookings={bookings}
            onDateClick={handleDateClick}
            selectedBooking={editingBooking}
          />
        </div>
        
        <div className="sidebar">
          <button
            className="btn btn-primary new-booking-btn"
            onClick={() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              setSelectedDate(`${year}-${month}-${day}`);
              setEditingBooking(null);
              setShowForm(true);
            }}
          >
            + 新建預訂
          </button>
          
          {bookings.length === 0 && !isLoading && (
            <>
              {(() => {
                try {
                  const stored = localStorage.getItem('room-bookings');
                  if (stored) {
                    const localBookings: Booking[] = JSON.parse(stored);
                    if (localBookings.length > 0) {
                      return (
                        <button
                          className="btn btn-secondary"
                          onClick={handleImportFromLocalStorage}
                          style={{ marginTop: '10px', width: '100%', backgroundColor: '#22c55e' }}
                        >
                          📥 从本地导入 ({localBookings.length} 个预订)
                        </button>
                      );
                    }
                  }
                } catch (e) {
                  // 忽略错误
                }
                return (
                  <button
                    className="btn btn-secondary"
                    onClick={handleInitializeData}
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    🔄 初始化數據（添加示例預訂）
                  </button>
                );
              })()}
            </>
          )}
          
          <BookingList
            bookings={bookings}
            onEdit={handleEditBooking}
            onDelete={handleDeleteBooking}
          />
        </div>
      </main>

      {showForm && (
        <BookingForm
          initialDate={selectedDate}
          booking={editingBooking}
          onSave={handleSaveBooking}
          onCancel={handleCancelForm}
          onDelete={handleDeleteBooking}
        />
      )}
    </div>
  );
}

export default App;

