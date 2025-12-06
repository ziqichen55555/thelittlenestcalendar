#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试 Supabase 连接的脚本
"""

import requests
import json
import sys
from datetime import datetime

# Supabase 配置
SUPABASE_URL = 'https://ivsokmmynbxguukzukvv.supabase.co'
SUPABASE_ANON_KEY = 'sb_publishable_I5EyEfT_eTSSfsdC6mMVbA_b6SiV6ox'

def print_section(title):
    """打印分节标题"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_connection():
    """测试 Supabase 连接"""
    print_section("测试 1: 检查 Supabase 连接")
    
    try:
        # 测试获取所有数据
        url = f"{SUPABASE_URL}/rest/v1/bookings"
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"✅ 连接成功！")
        print(f"   状态码: {response.status_code}")
        print(f"   状态文本: {response.reason}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   当前记录数: {len(data) if isinstance(data, list) else 0}")
            if isinstance(data, list) and len(data) > 0:
                print(f"   第一条记录: {json.dumps(data[0], indent=2, ensure_ascii=False)}")
            else:
                print(f"   ℹ️ 表是空的（这是正常的，表刚创建）")
            return True
        elif response.status_code == 401:
            print(f"❌ 认证失败（401）")
            print(f"   可能的原因：Anon Key 不正确")
            print(f"   💡 请检查 Supabase Dashboard → Settings → API → anon public key")
            return False
        elif response.status_code == 404:
            print(f"❌ 表不存在（404）")
            print(f"   可能的原因：bookings 表未创建")
            print(f"   💡 请在 Supabase 中运行 创建bookings表的SQL.sql")
            return False
        else:
            print(f"⚠️ 意外状态码: {response.status_code}")
            print(f"   响应: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 连接失败！")
        print(f"   错误类型: {type(e).__name__}")
        print(f"   错误信息: {str(e)}")
        return False

def test_add():
    """测试添加数据"""
    print_section("测试 2: 添加数据")
    
    test_data = {
        'id': f'test-{int(datetime.now().timestamp() * 1000)}',
        'startDate': '2025-12-06',
        'endDate': '2025-12-08',
        'guests': 2,
        'note': 'Python 测试数据 - 可以删除',
        'color': None
    }
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/bookings"
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
        }
        
        print(f"   发送数据: {json.dumps(test_data, indent=2, ensure_ascii=False)}")
        
        response = requests.post(url, headers=headers, json=test_data, timeout=10)
        
        print(f"   状态码: {response.status_code}")
        print(f"   状态文本: {response.reason}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ 添加成功！")
            print(f"   返回数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
            return True, data[0]['id'] if isinstance(data, list) and len(data) > 0 else test_data['id']
        else:
            print(f"❌ 添加失败")
            print(f"   响应: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ 添加失败！")
        print(f"   错误: {str(e)}")
        return False, None

def test_get_all():
    """测试获取所有数据"""
    print_section("测试 3: 获取所有数据")
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/bookings?order=startDate.asc"
        headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 获取成功！")
            print(f"   记录数: {len(data)}")
            if len(data) > 0:
                print(f"   数据示例:")
                for i, item in enumerate(data[:3], 1):
                    print(f"     {i}. {json.dumps(item, indent=2, ensure_ascii=False)}")
            return True
        else:
            print(f"❌ 获取失败")
            print(f"   状态码: {response.status_code}")
            print(f"   响应: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 获取失败！")
        print(f"   错误: {str(e)}")
        return False

def main():
    """主函数"""
    print_section("Supabase 连接测试")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"Anon Key: {SUPABASE_ANON_KEY[:20]}...")
    
    # 测试 1: 连接
    connection_ok = test_connection()
    
    if not connection_ok:
        print("\n❌ 连接失败，请检查配置")
        return 1
    
    # 测试 2: 添加数据
    add_ok, test_id = test_add()
    
    # 等待一下
    import time
    time.sleep(1)
    
    # 测试 3: 获取所有数据
    get_ok = test_get_all()
    
    # 总结
    print_section("测试总结")
    print(f"连接测试: {'✅ 通过' if connection_ok else '❌ 失败'}")
    print(f"添加数据:  {'✅ 通过' if add_ok else '❌ 失败'}")
    print(f"获取数据:  {'✅ 通过' if get_ok else '❌ 失败'}")
    
    if connection_ok and add_ok and get_ok:
        print("\n🎉 所有测试通过！Supabase 配置正确，应用应该可以正常工作。")
        print("\n📖 下一步：")
        print("   1. 重新启动开发服务器：npm run dev")
        print("   2. 打开应用测试添加/更新/删除功能")
        return 0
    else:
        print("\n⚠️ 部分测试失败，需要检查配置。")
        if not connection_ok:
            print("\n💡 连接失败，请检查：")
            print("   - Supabase URL 是否正确")
            print("   - Anon Key 是否正确")
            print("   - bookings 表是否已创建")
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

