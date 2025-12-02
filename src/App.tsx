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
    // 每次组件加载时都重新获取数据，确保数据是最新的
    const loadBookings = () => {
      const existingBookings = getBookings();
      
      // 如果已有数据，直接加载
      if (existingBookings.length > 0) {
        setBookings(existingBookings);
        return;
      }
      
      // 如果没有数据，插入初始数据
      const initialBookings: Booking[] = [
        {
          id: '1',
          startDate: '2024-12-03',
          endDate: '2024-12-06',
          guests: 1,
          note: 'Anthony 一个人 男',
        },
        {
          id: '2',
          startDate: '2024-12-06',
          endDate: '2024-12-07',
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
      setBookings(initialBookings);
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
    setBookings(getBookings());
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
      setBookings(getBookings());
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

