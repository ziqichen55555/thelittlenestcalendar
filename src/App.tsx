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
      'https://script.google.com/macros/s/AKfycbw6krzeMoNDYgpFu1DBeOAoDoOsbps8MbSpvO-1SUDv9r3YkIATO91hfL1pK94zQPMi/exec';
    
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
    
    getBookings()
      .then((existingBookings) => {
        setIsLoading(false);
        if (existingBookings.length === 0) {
          console.log('没有云端数据');
          setError(null); // 没有数据也不显示错误，让用户直接添加
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
        setError(`连接数据库失败: ${error instanceof Error ? error.message : '未知错误'}. 请检查 Google Apps Script 配置。`);
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
      
      // 提供更友好的错误提示
      let userMessage = `❌ 保存失败: ${errorMessage}`;
      if (errorMessage.includes('Load failed') || errorMessage.includes('Failed to fetch')) {
        userMessage += '\n\n可能的原因：\n1. 网络连接问题\n2. Google Apps Script 配置问题\n3. CORS 权限问题\n\n请检查：\n- 网络连接是否正常\n- Google Apps Script Web App 是否已正确部署\n- Web App 的访问权限是否设置为"所有人"';
      }
      
      alert(userMessage);
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
        alert('✓ 预订已删除！');
        // 数据会自动通过实时监听更新
      } catch (error) {
        console.error('❌ 删除预订失败:', error);
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        
        // 提供更友好的错误提示
        let userMessage = `❌ 删除失败: ${errorMessage}`;
        if (errorMessage.includes('网络连接失败') || errorMessage.includes('Load failed') || errorMessage.includes('Failed to fetch')) {
          userMessage += '\n\n可能的原因：\n1. 网络连接问题\n2. Google Apps Script 不支持 delete action\n3. 请检查浏览器控制台的详细错误信息\n\n解决方案：\n- 确保 Google Apps Script 已更新为支持 delete action（查看 更新GoogleScript.md）\n- 检查网络连接\n- 查看浏览器控制台获取详细错误';
        }
        
        alert(userMessage);
        setError(errorMessage);
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBooking(null);
    setSelectedDate('');
  };

  // 从 localStorage 导入数据

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

