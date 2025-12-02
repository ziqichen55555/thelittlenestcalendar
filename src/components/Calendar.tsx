import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { formatDate, getDaysInMonth, getFirstDayOfMonth, isDateInRange, parseDate } from '../utils/dateUtils';
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

  // 当 bookings 变化时，强制重新渲染，并自动切换到有预订的月份
  useEffect(() => {
    console.log('=== Calendar: bookings prop 变化 ===');
    console.log('bookings 数量:', bookings.length);
    console.log('bookings 内容:', JSON.stringify(bookings, null, 2));
    
    // 如果当前月份没有预订，自动切换到有预订的最近月份
    if (bookings.length > 0) {
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      // 检查当前月份是否有预订
      const hasBookingInCurrentMonth = bookings.some(b => {
        const start = parseDate(b.startDate);
        const end = parseDate(b.endDate);
        return (start.getFullYear() === currentYear && start.getMonth() === currentMonth) ||
               (end.getFullYear() === currentYear && end.getMonth() === currentMonth) ||
               (start <= new Date(currentYear, currentMonth + 1, 0) && end >= new Date(currentYear, currentMonth, 1));
      });
      
      // 如果当前月份没有预订，找到最近的预订日期
      if (!hasBookingInCurrentMonth) {
        const allDates = bookings.flatMap(b => {
          const dates = [];
          const start = parseDate(b.startDate);
          const end = parseDate(b.endDate);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
          }
          return dates;
        });
        
        if (allDates.length > 0) {
          // 找到最近的未来日期，或者如果没有未来日期，找最近的过去日期
          const now = new Date();
          const futureDates = allDates.filter(d => d >= now);
          const targetDate = futureDates.length > 0 
            ? futureDates.sort((a, b) => a.getTime() - b.getTime())[0]
            : allDates.sort((a, b) => b.getTime() - a.getTime())[0];
          
          if (targetDate) {
            const targetYear = targetDate.getFullYear();
            const targetMonth = targetDate.getMonth();
            if (targetYear !== currentYear || targetMonth !== currentMonth) {
              console.log(`自动切换到有预订的月份: ${targetYear}年${targetMonth + 1}月`);
              setCurrentDate(new Date(targetYear, targetMonth, 1));
              return; // 提前返回，避免重复设置
            }
          }
        }
      }
    }
    
    // 强制重新渲染日历
    setCurrentDate(new Date(currentDate.getTime()));
    console.log('已触发重新渲染');
  }, [bookings]);

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
    const dateStr = formatDate(date);
    // 直接使用字符串比较，更可靠
    const found = bookings.find(b => {
      const inRange = dateStr >= b.startDate && dateStr <= b.endDate;
      if (inRange) {
        console.log(`✓ 找到预订: ${dateStr} 在 ${b.startDate} 到 ${b.endDate} 之间`, b);
      }
      return inRange;
    });
    if (!found) {
      // 调试：检查为什么没找到
      if (bookings.length > 0 && (dateStr === '2024-12-03' || dateStr === '2024-12-06' || dateStr === '2024-12-07')) {
        console.log(`✗ 未找到预订: ${dateStr}`, {
          bookings: bookings.map(b => ({ start: b.startDate, end: b.endDate })),
          dateStr
        });
      }
    }
    return found || null;
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
    
    // 调试：检查 bookings 数据
    console.log('=== 开始渲染日历 ===');
    console.log('当前月份:', year, month + 1);
    console.log('预订数量:', bookings.length);
    if (bookings.length > 0) {
      console.log('所有预订数据:', JSON.stringify(bookings, null, 2));
      // 检查当前月份是否有预订
      const monthBookings = bookings.filter(b => {
        const start = parseDate(b.startDate);
        const end = parseDate(b.endDate);
        return (start.getFullYear() === year && start.getMonth() === month) ||
               (end.getFullYear() === year && end.getMonth() === month) ||
               (start <= new Date(year, month + 1, 0) && end >= new Date(year, month, 1));
      });
      console.log('当前月份的预订:', monthBookings.length, monthBookings);
    }
    
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

      // 确定显示哪个预订
      const displayBooking = isSplitDay ? endingBooking : booking;
      
      // 判断是否是开始日或结束日（但不是分割日）
      const isStartOnly = isStart && !isSplitDay;
      const isEndOnly = isEnd && !isSplitDay;
      
      // 调试：检查特定日期（只对前几个有预订的日期输出，避免日志过多）
      if (booking && (dateStr === '2024-12-03' || dateStr === '2024-12-06' || dateStr === '2024-12-07' || dateStr === '2025-01-11')) {
        console.log(`日期 ${dateStr} (${day}号):`, { 
          booking: { id: booking.id, start: booking.startDate, end: booking.endDate, color: booking.color },
          isStart, 
          isEnd,
          isStartOnly,
          isEndOnly,
          isSplitDay,
          dateStr,
          hasBookingClass: displayBooking ? 'has-booking' : '',
          specialClass: displayBooking?.color === 'green' ? 'special-booking' : '',
          startOnlyClass: isStartOnly ? 'start-only' : '',
          endOnlyClass: isEndOnly ? 'end-only' : '',
          splitDayClass: isSplitDay ? 'split-day' : ''
        });
      }

      days.push(
        <div
          key={day}
          className={`calendar-day ${displayBooking ? 'has-booking' : ''} ${displayBooking?.color === 'green' ? 'special-booking' : ''} ${isSelected ? 'selected' : ''} ${today ? 'today' : ''} ${isStartOnly ? 'start-only' : ''} ${isEndOnly ? 'end-only' : ''} ${isSplitDay ? 'split-day' : ''}`}
          onClick={() => onDateClick(dateStr)}
          title={displayBooking ? `${displayBooking.guests}人 - ${displayBooking.note || '無備註'}` : ''}
          style={(isSplitDay ? {
            '--ending-color': endingBooking?.color === 'green' 
              ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '--starting-color': startingBooking?.color === 'green'
              ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          } : (isStartOnly || isEndOnly) ? {
            '--booking-color': displayBooking?.color === 'green'
              ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          } : {}) as React.CSSProperties}
        >
          {isSplitDay && (
            <>
              <div className="split-background ending-bg"></div>
              <div className="split-background starting-bg"></div>
              <div className="split-line"></div>
            </>
          )}
          {isStartOnly && (
            <>
              <div className="split-background booking-bg-start"></div>
              <div className="split-line"></div>
            </>
          )}
          {isEndOnly && (
            <>
              <div className="split-background booking-bg-end"></div>
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
      <div className="calendar-days" key={`calendar-${bookings.length}-${year}-${month}`}>
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default Calendar;

