import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Booking } from '../types';

const COLLECTION_NAME = 'bookings';

// 将 Firestore 文档转换为 Booking
const docToBooking = (doc: any): Booking => {
  const data = doc.data();
  return {
    id: doc.id,
    startDate: data.startDate,
    endDate: data.endDate,
    guests: data.guests,
    note: data.note || '',
    color: data.color || undefined,
  };
};

// 获取所有预订（一次性）
export const getBookings = async (): Promise<Booking[]> => {
  try {
    console.log('📡 从云端获取预订数据...');
    const q = query(collection(db, COLLECTION_NAME), orderBy('startDate', 'asc'));
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(docToBooking);
    console.log('✓ 成功获取', bookings.length, '个预订');
    return bookings;
  } catch (error) {
    console.error('❌ 获取预订失败:', error);
    throw error;
  }
};

// 监听预订变化（实时同步）
export const subscribeToBookings = (
  callback: (bookings: Booking[]) => void
): (() => void) => {
  console.log('👂 开始监听云端数据变化...');
  const q = query(collection(db, COLLECTION_NAME), orderBy('startDate', 'asc'));
  
  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const bookings = querySnapshot.docs.map(docToBooking);
      console.log('🔄 云端数据更新:', bookings.length, '个预订');
      callback(bookings);
    },
    (error) => {
      console.error('❌ 监听数据变化失败:', error);
    }
  );
  
  return unsubscribe;
};

// 添加预订
export const addBooking = async (booking: Booking): Promise<void> => {
  try {
    console.log('➕ 添加预订到云端:', booking);
    await addDoc(collection(db, COLLECTION_NAME), {
      startDate: booking.startDate,
      endDate: booking.endDate,
      guests: booking.guests,
      note: booking.note || '',
      color: booking.color || null,
    });
    console.log('✓ 预订添加成功');
  } catch (error) {
    console.error('❌ 添加预订失败:', error);
    throw error;
  }
};

// 更新预订
export const updateBooking = async (id: string, updated: Booking): Promise<void> => {
  try {
    console.log('✏️ 更新云端预订:', id, updated);
    const bookingRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(bookingRef, {
      startDate: updated.startDate,
      endDate: updated.endDate,
      guests: updated.guests,
      note: updated.note || '',
      color: updated.color || null,
    });
    console.log('✓ 预订更新成功');
  } catch (error) {
    console.error('❌ 更新预订失败:', error);
    throw error;
  }
};

// 删除预订
export const deleteBooking = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ 从云端删除预订:', id);
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    console.log('✓ 预订删除成功');
  } catch (error) {
    console.error('❌ 删除预订失败:', error);
    throw error;
  }
};

// 保存所有预订（用于初始化数据）
export const saveBookings = async (bookings: Booking[]): Promise<void> => {
  try {
    console.log('💾 保存', bookings.length, '个预订到云端...');
    // 先获取现有数据
    const existing = await getBookings();
    
    // 删除所有现有数据
    for (const booking of existing) {
      await deleteBooking(booking.id);
    }
    
    // 添加新数据
    for (const booking of bookings) {
      await addBooking(booking);
    }
    
    console.log('✓ 所有预订保存成功');
  } catch (error) {
    console.error('❌ 保存预订失败:', error);
    throw error;
  }
};

