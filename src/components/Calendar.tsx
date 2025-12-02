import { useState } from 'react';
import { Booking } from '../types';
import { formatDate, getDaysInMonth, getFirstDayOfMonth, isDateInRange } from '../utils/dateUtils';

interface CalendarProps {
  bookings: Booking[];
  onDateClick: (date: string) => void;
  selectedBooking: Booking | null;
}

const Calendar = ({ bookings, onDateClick, selectedBooking }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getBookingForDate = (date: Date): Booking | null => {
    return bookings.find(b => isDateInRange(date, b.startDate, b.endDate)) || null;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedBooking) return false;
    return isDateInRange(date, selectedBooking.startDate, selectedBooking.endDate);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // 空白天数
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // 日期天数
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const booking = getBookingForDate(date);
      const isSelected = isDateSelected(date);
      const isStart = booking && booking.startDate === dateStr;
      const isEnd = booking && booking.endDate === dateStr;

      days.push(
        <div
          key={day}
          className={`calendar-day ${booking ? 'has-booking' : ''} ${isSelected ? 'selected' : ''} ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''}`}
          onClick={() => onDateClick(dateStr)}
          title={booking ? `${booking.guests}人 - ${booking.note || '無備註'}` : ''}
        >
          <span className="day-number">{day}</span>
          {booking && (
            <div className="booking-indicator">
              <span className="guests-count">{booking.guests}人</span>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button">‹</button>
        <h2>{year}年 {monthNames[month]}</h2>
        <button onClick={nextMonth} className="nav-button">›</button>
      </div>
      <div className="calendar-weekdays">
        {dayNames.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      <div className="calendar-days">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default Calendar;

