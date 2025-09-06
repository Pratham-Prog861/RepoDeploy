--------------------------------------------------------------------
-- Deployments table
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deployments (
  id            TEXT PRIMARY KEY,
  repo_url      TEXT NOT NULL,
  status        TEXT NOT NULL
                  DEFAULT 'pending'
                  CHECK (status IN ('pending','building','deployed','failed')),
  live_url      TEXT,
  build_logs    TEXT[] DEFAULT ARRAY[]::text[],   -- empty array by default
  error_message TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------
-- Indexes (helpful for UI dashboards, filtering by status, etc.)
--------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_deployments_status
  ON deployments (status);

CREATE INDEX IF NOT EXISTS idx_deployments_created_at
  ON deployments (created_at DESC);

--------------------------------------------------------------------
-- Row‑Level Security
--------------------------------------------------------------------
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------
-- Policies
--------------------------------------------------------------------
-- 1️⃣ Public read‑only access (anyone can SELECT)
DROP POLICY IF EXISTS "Allow public read access" ON deployments;
CREATE POLICY "Allow public read access"
  ON deployments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2️⃣ Anyone can INSERT a new deployment record
DROP POLICY IF EXISTS "Allow public insert" ON deployments;
CREATE POLICY "Allow public insert"
  ON deployments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3️⃣ Anyone can UPDATE deployments (you may tighten this later)
DROP POLICY IF EXISTS "Allow public update" ON deployments;
CREATE POLICY "Allow public update"
  ON deployments
  FOR UPDATE
  TO anon, authenticated
  USING (true);          -- row‑level filter
  -- WITH CHECK (true);  -- optional; omitted because USING already allows any change

--------------------------------------------------------------------
-- Trigger to keep updated_at in sync
--------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;  -- runs with owner privileges

DROP TRIGGER IF EXISTS update_deployments_updated_at ON deployments;
CREATE TRIGGER update_deployments_updated_at
  BEFORE UPDATE ON deployments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------------------------
-- Helper function to append a build‑log entry
--------------------------------------------------------------------
CREATE OR REPLACE FUNCTION add_build_log(
    deployment_id TEXT,
    log_message   TEXT
)
RETURNS deployments AS $$
DECLARE
  result deployments;
BEGIN
  UPDATE deployments
     SET build_logs = build_logs || ARRAY[log_message],
         updated_at = NOW()
   WHERE id = deployment_id
   RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;   -- prevents RLS bypass

--------------------------------------------------------------------
-- End of migration
--------------------------------------------------------------------