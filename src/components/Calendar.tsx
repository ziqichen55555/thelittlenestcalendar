import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { formatDate, getDaysInMonth, getFirstDayOfMonth, isDateInRange } from '../utils/dateUtils';
import { fetchPerthWeather, WeatherData } from '../utils/weather';

interface CalendarProps {
  bookings: Booking[];
  onDateClick: (date: string) => void;
  selectedBooking: Booking | null;
}

const Calendar = ({ bookings, onDateClick, selectedBooking }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    // 只在当前月份包含今天时获取天气
    const today = new Date();
    if (year === today.getFullYear() && month === today.getMonth()) {
      fetchPerthWeather()
        .then((data) => {
          if (data) {
            setWeather(data);
          } else {
            // 如果获取失败，设置一个默认值用于调试
            console.log('天气数据获取失败，请检查网络或 CORS 设置');
          }
        })
        .catch((error) => {
          console.error('天气获取错误:', error);
        });
    } else {
      setWeather(null);
    }
  }, [year, month]);

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

  // 获取在某一天结束的预订
  const getEndingBooking = (dateStr: string): Booking | null => {
    return bookings.find(b => b.endDate === dateStr) || null;
  };

  // 获取在某一天开始的预订
  const getStartingBooking = (dateStr: string): Booking | null => {
    return bookings.find(b => b.startDate === dateStr) || null;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedBooking) return false;
    return isDateInRange(date, selectedBooking.startDate, selectedBooking.endDate);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
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
      const today = isToday(date);

      // 检查是否是分割日（既是结束又是开始）
      const endingBooking = getEndingBooking(dateStr);
      const startingBooking = getStartingBooking(dateStr);
      const isSplitDay = endingBooking && startingBooking && endingBooking.id !== startingBooking.id;

      // 确定显示哪个预订（优先显示结束的预订，因为用户说"一般是上个订单的颜色"）
      const displayBooking = isSplitDay ? endingBooking : booking;

      days.push(
        <div
          key={day}
          className={`calendar-day ${displayBooking ? 'has-booking' : ''} ${displayBooking?.color === 'green' ? 'special-booking' : ''} ${isSelected ? 'selected' : ''} ${today ? 'today' : ''} ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''} ${isSplitDay ? 'split-day' : ''}`}
          onClick={() => onDateClick(dateStr)}
          title={displayBooking ? `${displayBooking.guests}人 - ${displayBooking.note || '無備註'}` : ''}
          style={isSplitDay ? {
            '--ending-color': endingBooking?.color === 'green' 
              ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '--starting-color': startingBooking?.color === 'green'
              ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          } as React.CSSProperties : undefined}
        >
          {isSplitDay && (
            <>
              <div className="split-background ending-bg"></div>
              <div className="split-background starting-bg"></div>
              <div className="split-line"></div>
            </>
          )}
          <span className="day-number">{day}</span>
          {today && (
            <div className="weather-info">
              {weather ? (
                <>
                  <span className="weather-icon">{weather.icon}</span>
                  <span className="weather-temp">{weather.temp}</span>
                </>
              ) : (
                <span className="weather-placeholder">Perth</span>
              )}
            </div>
          )}
          {displayBooking && (
            <div className="booking-indicator">
              <span className="guests-count">{displayBooking.guests}人</span>
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

