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

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Firestore
export const db = getFirestore(app);

export default app;

