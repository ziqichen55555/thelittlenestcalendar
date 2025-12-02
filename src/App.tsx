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
} from './utils/cloudStorage';

function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    console.log('=== App 组件加载 ===');
    console.log('当前环境:', {
      href: window.location.href,
      pathname: window.location.pathname,
      origin: window.location.origin,
    });
    console.log('=== App: 连接云端数据库 ===');
    
    // 设置实时监听，自动同步云端数据
    const unsubscribe = subscribeToBookings((bookings) => {
      console.log('📥 收到云端数据更新:', bookings.length, '个预订');
      console.log('📊 当前所有预订数据:', bookings);
      setBookings(bookings);
    });
    
    // 初始化：检查是否有数据，如果没有则插入初始数据
    getBookings()
      .then((existingBookings) => {
        if (existingBookings.length === 0) {
          console.log('没有现有数据，插入初始数据');
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
          
          saveBookings(initialBookings)
            .then(() => {
              console.log('✓ 初始数据保存成功');
            })
            .catch((error) => {
              console.error('❌ 保存初始数据失败:', error);
            });
        } else {
          console.log('✓ 已有云端数据，数量:', existingBookings.length);
          console.log('📊 当前所有预订数据:', existingBookings);
          console.log('📋 预订详情:');
          existingBookings.forEach((booking, index) => {
            console.log(`  ${index + 1}. ${booking.startDate} - ${booking.endDate} (${booking.guests}人) - ${booking.note || '无备注'}`);
          });
        }
      })
      .catch((error) => {
        console.error('❌ 加载云端数据失败:', error);
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
      } else {
        await addBooking(booking);
        console.log('✓ 预订添加成功');
      }
      // 数据会自动通过实时监听更新，不需要手动刷新
      setShowForm(false);
      setEditingBooking(null);
      setSelectedDate('');
    } catch (error) {
      console.error('❌ 保存预订失败:', error);
      alert('保存失败，请检查网络连接或稍后重试');
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

