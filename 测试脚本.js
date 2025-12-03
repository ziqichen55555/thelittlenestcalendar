// ============================================
// 直接测试 OPTIONS 请求的脚本
// ============================================
// 复制这个脚本到浏览器控制台（F12）直接运行

const API_URL = 'https://script.google.com/macros/s/AKfycbz6aY83vkEBpdpO8EJOWaA4HWob6p7vnc-wyoL0Dlbd_WH5sRdeeCn7qjVsSMpro2vk/exec';

console.log('=== 开始测试 OPTIONS 请求 ===');
console.log('URL:', API_URL);

// 测试 OPTIONS 请求
fetch(API_URL, {
  method: 'OPTIONS',
  headers: {
    'Origin': window.location.origin,
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
})
.then(response => {
  console.log('✅ OPTIONS 请求成功！');
  console.log('状态码:', response.status);
  console.log('状态文本:', response.statusText);
  console.log('响应头:', Object.fromEntries(response.headers.entries()));
  
  return response.text();
})
.then(text => {
  console.log('响应内容:', text);
  console.log('响应长度:', text.length);
})
.catch(error => {
  console.error('❌ OPTIONS 请求失败！');
  console.error('错误类型:', error.constructor.name);
  console.error('错误信息:', error.message);
  console.error('完整错误:', error);
  
  // 检查是否是 CORS 错误
  if (error.message.includes('CORS') || error.message.includes('preflight') || error.message.includes('Load failed')) {
    console.error('\n💡 这是 CORS 错误！');
    console.error('可能的原因：');
    console.error('1. doOptions 函数未正确部署');
    console.error('2. Web App 访问权限未设置为"所有人"');
    console.error('3. 网络连接问题');
  }
});

// 同时测试 GET 请求（作为对比）
console.log('\n=== 测试 GET 请求（作为对比）===');
fetch(API_URL, {
  method: 'GET'
})
.then(response => {
  console.log('✅ GET 请求成功！');
  console.log('状态码:', response.status);
  return response.json();
})
.then(data => {
  console.log('GET 响应数据:', data);
})
.catch(error => {
  console.error('❌ GET 请求失败！');
  console.error('错误:', error.message);
});

