#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试 Google Apps Script Web App 的脚本
测试 OPTIONS、GET、POST 请求
"""

import requests
import json
import sys
from datetime import datetime

# Google Apps Script Web App URL
API_URL = 'https://script.google.com/macros/s/AKfycbz6aY83vkEBpdpO8EJOWaA4HWob6p7vnc-wyoL0Dlbd_WH5sRdeeCn7qjVsSMpro2vk/exec'

def print_section(title):
    """打印分节标题"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_options():
    """测试 OPTIONS 请求（CORS 预检）"""
    print_section("测试 1: OPTIONS 请求（CORS 预检）")
    
    try:
        response = requests.options(
            API_URL,
            headers={
                'Origin': 'https://ziqichen55555.github.io',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=10
        )
        
        print(f"✅ OPTIONS 请求成功！")
        print(f"   状态码: {response.status_code}")
        print(f"   状态文本: {response.reason}")
        print(f"   响应头:")
        for key, value in response.headers.items():
            print(f"     {key}: {value}")
        print(f"   响应内容: {response.text}")
        print(f"   响应长度: {len(response.text)}")
        
        return response.status_code in [200, 204]
        
    except requests.exceptions.RequestException as e:
        print(f"❌ OPTIONS 请求失败！")
        print(f"   错误类型: {type(e).__name__}")
        print(f"   错误信息: {str(e)}")
        
        if 'CORS' in str(e) or 'preflight' in str(e).lower():
            print(f"\n💡 这是 CORS 错误！")
            print(f"   可能的原因：")
            print(f"   1. doOptions 函数未正确部署")
            print(f"   2. Web App 访问权限未设置为'所有人'")
            print(f"   3. 网络连接问题")
        
        return False

def test_get():
    """测试 GET 请求"""
    print_section("测试 2: GET 请求")
    
    try:
        response = requests.get(API_URL, timeout=10)
        
        print(f"✅ GET 请求成功！")
        print(f"   状态码: {response.status_code}")
        print(f"   状态文本: {response.reason}")
        
        try:
            data = response.json()
            print(f"   响应数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
            if isinstance(data, list):
                print(f"   记录数: {len(data)}")
            elif isinstance(data, dict) and 'error' in data:
                print(f"   ⚠️ 错误: {data['error']}")
        except json.JSONDecodeError:
            print(f"   响应内容（非 JSON）: {response.text}")
        
        return response.status_code == 200
        
    except requests.exceptions.RequestException as e:
        print(f"❌ GET 请求失败！")
        print(f"   错误类型: {type(e).__name__}")
        print(f"   错误信息: {str(e)}")
        return False

def test_post():
    """测试 POST 请求"""
    print_section("测试 3: POST 请求")
    
    test_data = {
        'action': 'add',
        'ID': f'test-{int(datetime.now().timestamp() * 1000)}',
        'StartDate': '2025-12-04',
        'EndDate': '2025-12-06',
        'GuestsNo': 1,
        'Note': 'Python 测试数据 - 可以删除',
        'Color': ''
    }
    
    try:
        response = requests.post(
            API_URL,
            headers={
                'Content-Type': 'application/json',
            },
            json=test_data,
            timeout=10
        )
        
        print(f"✅ POST 请求成功！")
        print(f"   状态码: {response.status_code}")
        print(f"   状态文本: {response.reason}")
        print(f"   请求数据: {json.dumps(test_data, indent=2, ensure_ascii=False)}")
        
        try:
            data = response.json()
            print(f"   响应数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
        except json.JSONDecodeError:
            print(f"   响应内容（非 JSON）: {response.text}")
        
        return response.status_code == 200
        
    except requests.exceptions.RequestException as e:
        print(f"❌ POST 请求失败！")
        print(f"   错误类型: {type(e).__name__}")
        print(f"   错误信息: {str(e)}")
        
        if 'CORS' in str(e) or 'preflight' in str(e).lower():
            print(f"\n💡 这是 CORS 错误！")
            print(f"   说明 OPTIONS 预检请求可能失败")
        
        return False

def main():
    """主函数"""
    print_section("Google Apps Script Web App 测试")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"测试 URL: {API_URL}")
    
    results = {
        'options': False,
        'get': False,
        'post': False
    }
    
    # 测试 OPTIONS
    results['options'] = test_options()
    
    # 测试 GET
    results['get'] = test_get()
    
    # 只有在 OPTIONS 成功时才测试 POST
    if results['options']:
        results['post'] = test_post()
    else:
        print_section("测试 3: POST 请求（跳过）")
        print("⚠️ OPTIONS 请求失败，跳过 POST 测试")
        print("💡 POST 请求需要 OPTIONS 预检成功才能工作")
    
    # 总结
    print_section("测试总结")
    print(f"OPTIONS 请求: {'✅ 通过' if results['options'] else '❌ 失败'}")
    print(f"GET 请求:     {'✅ 通过' if results['get'] else '❌ 失败'}")
    print(f"POST 请求:    {'✅ 通过' if results['post'] else '❌ 失败'}")
    
    if all(results.values()):
        print("\n🎉 所有测试通过！CORS 配置正确，应用应该可以正常工作。")
        return 0
    else:
        print("\n⚠️ 部分测试失败，需要检查配置。")
        if not results['options']:
            print("\n📖 修复 OPTIONS 失败：")
            print("   1. 确认 Google Apps Script 代码中有 doOptions 函数")
            print("   2. 重新部署 Web App，选择'新版本'")
            print("   3. 确认'具有访问权限的用户' = '所有人'")
        return 1

if __name__ == '__main__':
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️ 测试被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ 测试脚本出错: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

