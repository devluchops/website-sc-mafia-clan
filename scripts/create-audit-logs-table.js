import { neon } from "@neondatabase/serverless";

async function createAuditLogsTable() {
  const sql = neon(process.env.DATABASE_URL);

  console.log("Creating audit_logs table...");

  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED')),
      table_name VARCHAR(100),
      record_id INTEGER,
      actor_discord_id VARCHAR(100),
      actor_discord_username VARCHAR(255),
      actor_email VARCHAR(255),
      actor_member_id INTEGER,
      permission_used VARCHAR(100),
      is_admin BOOLEAN DEFAULT false,
      old_values JSONB,
      new_values JSONB,
      changes JSONB,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log("Creating indexes...");

  await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_discord_id ON audit_logs(actor_discord_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(table_name, record_id)`;

  console.log("✅ Audit logs table created successfully!");
}

createAuditLogsTable().catch(console.error);
