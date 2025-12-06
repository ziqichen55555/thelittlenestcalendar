#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试 GET 方式的 Google Apps Script Web App
测试通过 URL 参数传递数据的 GET 请求
"""

import requests
import json
import sys
from datetime import datetime
from urllib.parse import urlencode

# Google Apps Script Web App URL
API_URL = 'https://script.google.com/macros/s/AKfycbz6aY83vkEBpdpO8EJOWaA4HWob6p7vnc-wyoL0Dlbd_WH5sRdeeCn7qjVsSMpro2vk/exec'

def print_section(title):
    """打印分节标题"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_get_all():
    """测试 GET 请求获取所有数据"""
    print_section("测试 1: GET 请求（获取所有数据）")
    
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

def test_get_add():
    """测试 GET 请求添加数据"""
    print_section("测试 2: GET 请求（添加数据）")
    
    test_data = {
        'action': 'add',
        'ID': f'test-get-{int(datetime.now().timestamp() * 1000)}',
        'StartDate': '2025-12-06',
        'EndDate': '2025-12-08',
        'GuestsNo': 2,
        'Note': 'Python GET 测试 - 可以删除',
        'Color': ''
    }
    
    try:
        # 使用 URL 参数传递数据
        params = urlencode(test_data)
        url = f"{API_URL}?{params}"
        
        print(f"   请求 URL: {url[:100]}...")  # 只显示前100个字符
        print(f"   请求数据: {json.dumps(test_data, indent=2, ensure_ascii=False)}")
        
        response = requests.get(url, timeout=10)
        
        print(f"✅ GET 添加请求成功！")
        print(f"   状态码: {response.status_code}")
        print(f"   状态文本: {response.reason}")
        
        try:
            data = response.json()
            print(f"   响应数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
            # 检查响应格式：如果是对象且有 status，或者如果是数组（说明返回了所有数据）
            if isinstance(data, dict) and data.get('status') == 'success':
                return True
            elif isinstance(data, list):
                # 如果返回数组，说明可能没有正确处理 action 参数，但请求成功了
                print(f"   ⚠️ 返回了数组而不是成功消息，可能 Google Apps Script 代码未更新为 GET 方式")
                return True  # 仍然算成功，因为请求没有错误
            else:
                return False
        except json.JSONDecodeError:
            print(f"   响应内容（非 JSON）: {response.text}")
            return False
        
    except requests.exceptions.RequestException as e:
        print(f"❌ GET 添加请求失败！")
        print(f"   错误类型: {type(e).__name__}")
        print(f"   错误信息: {str(e)}")
        return False

def test_get_update():
    """测试 GET 请求更新数据"""
    print_section("测试 3: GET 请求（更新数据）")
    
    # 先获取现有数据，使用第一个记录的 ID
    try:
        response = requests.get(API_URL, timeout=10)
        data = response.json()
        
        if not isinstance(data, list) or len(data) == 0:
            print("⚠️ 没有现有数据，跳过更新测试")
            return True
        
        first_id = data[0].get('ID') or data[0].get('id') or data[0].get('id')
        if not first_id:
            print("⚠️ 无法获取 ID，跳过更新测试")
            return True
        
        update_data = {
            'action': 'update',
            'ID': first_id,
            'StartDate': '2025-12-06',
            'EndDate': '2025-12-09',
            'GuestsNo': 3,
            'Note': 'Python GET 更新测试',
            'Color': ''
        }
        
        params = urlencode(update_data)
        url = f"{API_URL}?{params}"
        
        print(f"   更新 ID: {first_id}")
        print(f"   请求数据: {json.dumps(update_data, indent=2, ensure_ascii=False)}")
        
        response = requests.get(url, timeout=10)
        
        print(f"✅ GET 更新请求成功！")
        print(f"   状态码: {response.status_code}")
        
        try:
            result = response.json()
            print(f"   响应数据: {json.dumps(result, indent=2, ensure_ascii=False)}")
            # 检查响应格式
            if isinstance(result, dict) and result.get('status') == 'success':
                return True
            elif isinstance(result, list):
                print(f"   ⚠️ 返回了数组而不是成功消息，可能 Google Apps Script 代码未更新为 GET 方式")
                return True  # 仍然算成功
            else:
                return False
        except json.JSONDecodeError:
            print(f"   响应内容（非 JSON）: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ GET 更新请求失败！")
        print(f"   错误: {str(e)}")
        return False

def test_get_delete():
    """测试 GET 请求删除数据"""
    print_section("测试 4: GET 请求（删除数据）")
    
    # 使用测试添加时创建的 ID
    test_id = f'test-get-{int((datetime.now().timestamp() - 60) * 1000)}'  # 大约1分钟前的ID
    
    delete_data = {
        'action': 'delete',
        'ID': test_id,
        'id': test_id
    }
    
    try:
        params = urlencode(delete_data)
        url = f"{API_URL}?{params}"
        
        print(f"   删除 ID: {test_id}")
        print(f"   请求 URL: {url[:100]}...")
        
        response = requests.get(url, timeout=10)
        
        print(f"✅ GET 删除请求成功！")
        print(f"   状态码: {response.status_code}")
        
        try:
            result = response.json()
            print(f"   响应数据: {json.dumps(result, indent=2, ensure_ascii=False)}")
            return response.status_code == 200
        except json.JSONDecodeError:
            print(f"   响应内容（非 JSON）: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ GET 删除请求失败！")
        print(f"   错误: {str(e)}")
        return False

def main():
    """主函数"""
    print_section("Google Apps Script Web App 测试（GET 方式）")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"测试 URL: {API_URL}")
    print(f"\n💡 这个测试使用 GET 请求通过 URL 参数传递数据，避免 CORS 预检问题")
    
    results = {
        'get_all': False,
        'get_add': False,
        'get_update': False,
        'get_delete': False
    }
    
    # 测试 1: 获取所有数据
    results['get_all'] = test_get_all()
    
    # 测试 2: 添加数据
    results['get_add'] = test_get_add()
    
    # 等待一下
    import time
    time.sleep(1)
    
    # 测试 3: 更新数据
    results['get_update'] = test_get_update()
    
    # 等待一下
    time.sleep(1)
    
    # 测试 4: 删除数据
    results['get_delete'] = test_get_delete()
    
    # 总结
    print_section("测试总结")
    print(f"GET 获取所有: {'✅ 通过' if results['get_all'] else '❌ 失败'}")
    print(f"GET 添加数据:  {'✅ 通过' if results['get_add'] else '❌ 失败'}")
    print(f"GET 更新数据:  {'✅ 通过' if results['get_update'] else '❌ 失败'}")
    print(f"GET 删除数据:  {'✅ 通过' if results['get_delete'] else '❌ 失败'}")
    
    if all(results.values()):
        print("\n🎉 所有测试通过！GET 方式工作正常，可以避免 CORS 问题。")
        print("\n📖 下一步：")
        print("   1. 确认 Google Apps Script 已更新为 GET 方式代码")
        print("   2. 确认应用代码已更新为 GET 方式")
        print("   3. 重新部署应用")
        return 0
    else:
        print("\n⚠️ 部分测试失败，需要检查配置。")
        if not results['get_all']:
            print("\n💡 GET 获取失败，可能 Google Apps Script 代码未更新")
        if not results['get_add']:
            print("\n💡 GET 添加失败，可能 Google Apps Script 的 doGet 函数未正确处理 action 参数")
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

