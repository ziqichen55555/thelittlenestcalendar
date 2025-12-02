import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase 配置
// 注意：这些配置是公开的，可以安全地放在客户端代码中
// 安全性通过 Firestore 安全规则控制
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyReplaceWithYourOwn",
  authDomain: "thelittlenestcalendar.firebaseapp.com",
  projectId: "thelittlenestcalendar",
  storageBucket: "thelittlenestcalendar.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// 检查 Firebase 配置是否有效
export const isFirebaseConfigured = (): boolean => {
  return firebaseConfig.apiKey !== "AIzaSyDummyKeyReplaceWithYourOwn" &&
         firebaseConfig.projectId !== "thelittlenestcalendar" &&
         !firebaseConfig.apiKey.includes("Dummy");
};

// 初始化 Firebase
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

let app: FirebaseApp;
let db: Firestore;

try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✓ Firebase 已配置并初始化');
  } else {
    console.warn('⚠️ Firebase 配置未完成，请更新 src/config/firebase.ts');
    // 即使配置无效也初始化，这样错误会在实际使用时显示
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (error) {
  console.error('❌ Firebase 初始化失败:', error);
  throw error;
}

export { db };
export default app;

