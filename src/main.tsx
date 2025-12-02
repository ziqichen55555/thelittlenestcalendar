import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('=== 应用启动 ===');
console.log('当前 URL:', window.location.href);
console.log('Base path:', (import.meta as any).env?.BASE_URL || 'N/A');
console.log('Mode:', (import.meta as any).env?.MODE || 'N/A');
console.log('Root element:', document.getElementById('root'));

try {
  const root = document.getElementById('root');
  if (!root) {
    console.error('❌ 找不到 root 元素！');
    throw new Error('Root element not found');
  }
  
  console.log('✓ Root 元素找到，开始渲染应用');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('✓ 应用渲染完成');
} catch (error) {
  console.error('❌ 应用启动失败:', error);
}

