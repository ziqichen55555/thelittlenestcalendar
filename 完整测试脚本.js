// ============================================
// 完整的测试脚本（包括 OPTIONS、GET、POST）
// ============================================
// 复制这个脚本到浏览器控制台（F12）直接运行

const API_URL = 'https://script.google.com/macros/s/AKfycbz6aY83vkEBpdpO8EJOWaA4HWob6p7vnc-wyoL0Dlbd_WH5sRdeeCn7qjVsSMpro2vk/exec';

async function testAll() {
  console.log('=== 开始完整测试 ===\n');
  
  // 测试 1: OPTIONS 请求
  console.log('--- 测试 1: OPTIONS 请求 ---');
  try {
    const optionsResponse = await fetch(API_URL, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('✅ OPTIONS 成功');
    console.log('  状态码:', optionsResponse.status);
    console.log('  状态文本:', optionsResponse.statusText);
    console.log('  响应头:', Object.fromEntries(optionsResponse.headers.entries()));
    
    const optionsText = await optionsResponse.text();
    console.log('  响应内容:', optionsText);
    
    // 测试 2: GET 请求
    console.log('\n--- 测试 2: GET 请求 ---');
    const getResponse = await fetch(API_URL, {
      method: 'GET'
    });
    
    console.log('✅ GET 成功');
    console.log('  状态码:', getResponse.status);
    const getData = await getResponse.json();
    console.log('  数据:', getData);
    console.log('  记录数:', Array.isArray(getData) ? getData.length : 'N/A');
    
    // 测试 3: POST 请求（只有在 OPTIONS 成功时才测试）
    if (optionsResponse.status === 200 || optionsResponse.status === 204) {
      console.log('\n--- 测试 3: POST 请求 ---');
      const testData = {
        action: 'add',
        ID: 'test-' + Date.now(),
        StartDate: '2025-12-04',
        EndDate: '2025-12-06',
        GuestsNo: 1,
        Note: '测试数据 - 可以删除',
        Color: ''
      };
      
      const postResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      console.log('✅ POST 成功');
      console.log('  状态码:', postResponse.status);
      const postData = await postResponse.json();
      console.log('  响应数据:', postData);
    } else {
      console.log('\n--- 测试 3: POST 请求（跳过，因为 OPTIONS 失败）---');
      console.log('❌ OPTIONS 失败，POST 请求无法进行');
    }
    
    // 总结
    console.log('\n=== 测试完成 ===');
    if (optionsResponse.status === 200 || optionsResponse.status === 204) {
      console.log('✅ 所有测试通过！CORS 配置正确');
    } else {
      console.log('❌ OPTIONS 请求失败，需要修复 CORS 配置');
    }
    
  } catch (error) {
    console.error('❌ 测试失败！');
    console.error('错误类型:', error.constructor.name);
    console.error('错误信息:', error.message);
    console.error('完整错误:', error);
    
    if (error.message.includes('CORS') || error.message.includes('preflight') || error.message.includes('Load failed')) {
      console.error('\n💡 这是 CORS 错误！');
      console.error('可能的原因：');
      console.error('1. doOptions 函数未正确部署');
      console.error('2. Web App 访问权限未设置为"所有人"');
      console.error('3. 网络连接问题');
      console.error('\n📖 解决方案：');
      console.error('1. 确认 Google Apps Script 代码中有 doOptions 函数');
      console.error('2. 重新部署 Web App，选择"新版本"');
      console.error('3. 确认"具有访问权限的用户" = "所有人"');
    }
  }
}

// 运行测试
testAll();

