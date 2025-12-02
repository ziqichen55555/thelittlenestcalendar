import { useState, useEffect } from 'react';
import { Booking } from '../types';

interface BookingFormProps {
  initialDate?: string;
  booking?: Booking | null;
  onSave: (booking: Booking) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const BookingForm = ({ initialDate, booking, onSave, onCancel, onDelete }: BookingFormProps) => {
  const [startDate, setStartDate] = useState(initialDate || '');
  const [endDate, setEndDate] = useState(initialDate || '');
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);

  useEffect(() => {
    if (booking) {
      setStartDate(booking.startDate);
      setEndDate(booking.endDate);
      setGuests(booking.guests);
      setNote(booking.note);
      setIsSpecial(booking.color === 'green');
    } else if (initialDate) {
      setStartDate(initialDate);
      setEndDate(initialDate);
      setIsSpecial(false);
    }
  }, [booking, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      alert('請選擇日期範圍');
      return;
    }

    if (startDate > endDate) {
      alert('結束日期不能早於開始日期');
      return;
    }

    if (guests < 1) {
      alert('人數必須至少為1人');
      return;
    }

    const newBooking: Booking = {
      id: booking?.id || Date.now().toString(),
      startDate,
      endDate,
      guests,
      note: note.trim(),
      color: isSpecial ? 'green' : undefined,
    };

    onSave(newBooking);
  };

  return (
    <div className="booking-form-overlay" onClick={onCancel}>
      <div className="booking-form" onClick={(e) => e.stopPropagation()}>
        <h3>{booking ? '編輯預訂' : '新建預訂'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>開始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>結束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>人數</label>
            <input
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
              required
            />
          </div>
          <div className="form-group">
            <label>備註</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="輸入備註資訊..."
            />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isSpecial}
                onChange={(e) => setIsSpecial(e.target.checked)}
              />
              <span className="checkbox-text">綠色標記（特殊預訂）</span>
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">保存</button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">取消</button>
            {booking && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('確定要刪除這個預訂嗎？')) {
                    onDelete(booking.id);
                    onCancel();
                  }
                }}
                className="btn btn-danger"
              >
                刪除
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;

