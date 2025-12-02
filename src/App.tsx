import { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import { Booking } from './types';
import { getBookings, addBooking, updateBooking, deleteBooking, saveBookings } from './utils/storage';

function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    console.log('=== App: 加载预订数据 ===');
    // 每次组件加载时都重新获取数据，确保数据是最新的
    const loadBookings = () => {
      const existingBookings = getBookings();
      console.log('从 localStorage 读取的数据:', existingBookings);
      
      // 如果已有数据，直接加载
      if (existingBookings.length > 0) {
        console.log('使用现有数据，数量:', existingBookings.length);
        setBookings([...existingBookings]); // 使用展开运算符确保创建新数组
        return;
      }
      
      // 如果没有数据，插入初始数据
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
          startDate: '2025-01-11',
          endDate: '2025-01-23',
          guests: 1,
          note: 'auxence',
        },
        {
          id: '4',
          startDate: '2025-01-26',
          endDate: '2025-02-09',
          guests: 1,
          note: 'Sarah 巴黎',
        },
        {
          id: '5',
          startDate: '2025-02-10',
          endDate: '2025-02-11',
          guests: 2,
          note: '法国情侣',
          color: 'green',
        },
      ];
      
      saveBookings(initialBookings);
      console.log('保存初始数据，数量:', initialBookings.length);
      setBookings([...initialBookings]); // 使用展开运算符确保创建新数组
    };
    
    loadBookings();
  }, []);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setEditingBooking(null);
    setShowForm(true);
  };

  const handleSaveBooking = (booking: Booking) => {
    if (editingBooking) {
      updateBooking(booking.id, booking);
    } else {
      addBooking(booking);
    }
    // 立即获取最新数据并更新状态
    const updatedBookings = getBookings();
    console.log('保存后的预订数据:', updatedBookings);
    setBookings([...updatedBookings]); // 使用展开运算符确保创建新数组，触发重新渲染
    setShowForm(false);
    setEditingBooking(null);
    setSelectedDate('');
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setSelectedDate(booking.startDate);
    setShowForm(true);
  };

  const handleDeleteBooking = (id: string) => {
    if (confirm('確定要刪除這個預訂嗎？')) {
      deleteBooking(id);
      const updatedBookings = getBookings();
      setBookings([...updatedBookings]); // 使用展开运算符确保创建新数组
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
        <p>fangfang and chris
        </p>
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

