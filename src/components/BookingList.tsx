import { Booking } from '../types';
import { parseDate } from '../utils/dateUtils';

interface BookingListProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
}

const BookingList = ({ bookings, onEdit, onDelete }: BookingListProps) => {
  const sortedBookings = [...bookings].sort((a, b) => 
    a.startDate.localeCompare(b.startDate)
  );

  const formatDateDisplay = (dateStr: string): string => {
    const date = parseDate(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (sortedBookings.length === 0) {
    return (
      <div className="booking-list empty">
        <p>暫無預訂記錄</p>
      </div>
    );
  }

  return (
    <div className="booking-list">
      <h3>預訂列表</h3>
      <div className="bookings">
        {sortedBookings.map(booking => (
          <div key={booking.id} className={`booking-item ${booking.color === 'green' ? 'special-booking' : ''}`}>
            <div className="booking-info">
              <div className="booking-dates">
                {booking.color === 'green' && <span className="special-indicator">🟢</span>}
                {formatDateDisplay(booking.startDate)} - {formatDateDisplay(booking.endDate)}
              </div>
              <div className="booking-details">
                <span className="guests-badge">{booking.guests}人</span>
                {booking.note && (
                  <span className="note-text">{booking.note}</span>
                )}
              </div>
            </div>
            <div className="booking-actions">
              <button onClick={() => onEdit(booking)} className="btn btn-small">編輯</button>
              <button onClick={() => onDelete(booking.id)} className="btn btn-small btn-danger">刪除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingList;

