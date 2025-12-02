import { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import SyncPanel from './components/SyncPanel';
import { Booking } from './types';
import { getBookings, addBooking, updateBooking, deleteBooking, saveBookings } from './utils/storage';
import { importBookings } from './utils/cloudSync';

function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    // 先加载本地数据，确保页面能正常显示
    setBookings(getBookings());
    
    // 然后检查 URL 参数中是否有数据（用于跨设备同步）
    // 使用 setTimeout 确保页面先渲染
    setTimeout(() => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get('data');
        if (dataParam && dataParam.length > 0) {
          try {
            const json = decodeURIComponent(atob(dataParam));
            const importedBookings = importBookings(json);
            if (importedBookings && importedBookings.length > 0) {
              if (confirm(`檢測到同步數據，是否導入 ${importedBookings.length} 個預訂？`)) {
                saveBookings(importedBookings);
                setBookings(importedBookings);
              }
              // 清除 URL 参数
              window.history.replaceState({}, '', window.location.pathname);
            }
          } catch (error) {
            console.error('URL 數據解析失敗:', error);
            // 即使解析失败，也清除 URL 参数，避免重复尝试
            window.history.replaceState({}, '', window.location.pathname);
          }
        }
      } catch (error) {
        console.error('URL 參數處理失敗:', error);
      }
    }, 100);
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

  const handleImportBookings = (importedBookings: Booking[]) => {
    saveBookings(importedBookings);
    setBookings(importedBookings);
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
          
          <SyncPanel
            bookings={bookings}
            onImport={handleImportBookings}
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

