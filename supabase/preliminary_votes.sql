-- 海选投票模块：preliminary_votes 表
-- 在 Supabase SQL Editor 中运行此脚本

CREATE TABLE IF NOT EXISTS preliminary_votes (
  id          SERIAL PRIMARY KEY,
  voter_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  demo_id     INTEGER NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  submitted   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voter_id, demo_id)
);

CREATE INDEX IF NOT EXISTS idx_prelim_voter     ON preliminary_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_prelim_demo      ON preliminary_votes(demo_id);
CREATE INDEX IF NOT EXISTS idx_prelim_submitted ON preliminary_votes(voter_id, submitted);

-- 初始化海选配置（在 site_config 中插入默认值）
-- 注意：这些 key 不存在时才插入，已有时不覆盖
INSERT INTO site_config (key, value, updated_at)
VALUES
  ('preliminary_enabled',         'false', NOW()),
  ('preliminary_mode',            'A',     NOW()),
  ('preliminary_total',           '30',    NOW()),
  ('preliminary_optimizer_count', '15',    NOW()),
  ('preliminary_builder_count',   '15',    NOW()),
  ('preliminary_results_roles',   'admin', NOW()),
  ('preliminary_notice',          '海选投票暂未开始，敬请期待', NOW())
ON CONFLICT (key) DO NOTHING;
