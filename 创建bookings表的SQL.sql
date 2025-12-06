-- ============================================
-- 创建 bookings 表的 SQL 语句
-- ============================================
-- 在 Supabase SQL Editor 中运行此脚本

-- 创建表
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  note TEXT DEFAULT '',
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Allow public read" ON bookings;
DROP POLICY IF EXISTS "Allow public insert" ON bookings;
DROP POLICY IF EXISTS "Allow public update" ON bookings;
DROP POLICY IF EXISTS "Allow public delete" ON bookings;

-- 创建策略：允许所有人读取
CREATE POLICY "Allow public read" 
ON bookings 
FOR SELECT 
USING (true);

-- 创建策略：允许所有人插入
CREATE POLICY "Allow public insert" 
ON bookings 
FOR INSERT 
WITH CHECK (true);

-- 创建策略：允许所有人更新
CREATE POLICY "Allow public update" 
ON bookings 
FOR UPDATE 
USING (true);

-- 创建策略：允许所有人删除
CREATE POLICY "Allow public delete" 
ON bookings 
FOR DELETE 
USING (true);

-- 创建索引（可选，提高查询性能）
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(startDate);
CREATE INDEX IF NOT EXISTS idx_bookings_end_date ON bookings(endDate);

-- 验证表已创建
SELECT * FROM bookings LIMIT 1;

