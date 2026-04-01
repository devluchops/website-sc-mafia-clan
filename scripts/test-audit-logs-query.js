import { neon } from "@neondatabase/serverless";

async function testAuditLogsQuery() {
  const sql = neon(process.env.DATABASE_URL);

  console.log("Testing simple query without filters...");

  const logs = await sql`
    SELECT *
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT 10
    OFFSET 0
  `;

  console.log(`✅ Found ${logs.length} logs`);
  console.log("\nFirst log:");
  console.log(JSON.stringify(logs[0], null, 2));

  // Test count
  const countResult = await sql`
    SELECT COUNT(*) as count
    FROM audit_logs
  `;

  console.log(`\n✅ Total logs in DB: ${countResult[0].count}`);
}

testAuditLogsQuery().catch(console.error);
