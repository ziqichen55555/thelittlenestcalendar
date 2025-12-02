import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('=== 🚀 应用启动 (main.tsx) ===');
console.log('📍 当前 URL:', window.location.href);
console.log('📍 当前路径:', window.location.pathname);
console.log('📍 当前域名:', window.location.hostname);
console.log('📍 Base path:', (import.meta as any).env?.BASE_URL || 'N/A');
console.log('📍 Mode:', (import.meta as any).env?.MODE || 'N/A');
console.log('📍 环境变量:', {
  BASE_URL: (import.meta as any).env?.BASE_URL,
  MODE: (import.meta as any).env?.MODE,
  PROD: (import.meta as any).env?.PROD,
  DEV: (import.meta as any).env?.DEV,
});

console.log('🔍 检查 DOM 元素...');
const rootElement = document.getElementById('root');
console.log('📍 Root element:', rootElement);
console.log('📍 Root element 存在?', !!rootElement);
console.log('📍 Document ready state:', document.readyState);
console.log('📍 Document body:', document.body);

console.log('🔍 检查脚本标签...');
const allScripts = Array.from(document.querySelectorAll('script'));
console.log('📍 所有脚本标签数量:', allScripts.length);
allScripts.forEach((script, index) => {
  console.log(`📍 脚本 ${index + 1}:`, {
    src: script.src,
    type: script.type,
    async: script.async,
    defer: script.defer,
    text: script.textContent?.substring(0, 100),
  });
});

if (!rootElement) {
  console.error('❌ 找不到 root 元素！');
  console.error('📍 当前 HTML:', document.documentElement.outerHTML.substring(0, 500));
  throw new Error('Root element not found');
}

console.log('✓ Root 元素找到，开始渲染应用');
console.log('📍 Root element 内容:', rootElement.innerHTML.substring(0, 100));

try {
  console.log('🎨 创建 React Root...');
  const root = ReactDOM.createRoot(rootElement);
  console.log('✓ React Root 创建成功');
  
  console.log('🎨 开始渲染 App 组件...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('✓ 应用渲染完成');
  console.log('📍 渲染后的 root 内容:', rootElement.innerHTML.substring(0, 200));
} catch (error) {
  console.error('❌ 应用启动失败:', error);
  console.error('📍 错误类型:', error instanceof Error ? error.constructor.name : typeof error);
  console.error('📍 错误消息:', error instanceof Error ? error.message : String(error));
  console.error('📍 错误堆栈:', error instanceof Error ? error.stack : 'N/A');
  throw error;
}

// 监听页面加载事件
window.addEventListener('load', () => {
  console.log('📄 页面完全加载 (load 事件)');
  console.log('📍 所有脚本标签:', Array.from(document.querySelectorAll('script')).map(s => ({
    src: s.src,
    type: s.type,
    async: s.async,
    defer: s.defer,
  })));
  console.log('📍 所有样式标签:', Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => {
    const link = l as HTMLLinkElement;
    return {
      href: link.href,
      rel: link.rel,
    };
  }));
});

// 监听错误
window.addEventListener('error', (event) => {
  console.error('❌ 全局错误事件:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    stack: event.error?.stack,
  });
}, true);

// 监听资源加载错误
window.addEventListener('error', (event) => {
  if (event.target) {
    const target = event.target as HTMLElement;
    if (target.tagName) {
      const script = target as HTMLScriptElement;
      const link = target as HTMLLinkElement;
      console.error('❌ 资源加载失败:', {
        tag: target.tagName,
        src: script.src || link.href || 'N/A',
        type: script.type || link.rel || 'N/A',
      });
    }
  }
}, true);

