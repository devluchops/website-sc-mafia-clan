#!/usr/bin/env node

import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Usage: node scripts/run-migration.js <migration-file.sql>');
  process.exit(1);
}

try {
  const sql = neon(DATABASE_URL);
  const migrationSQL = readFileSync(migrationFile, 'utf8');

  console.log(`🚀 Running migration: ${migrationFile}`);
  console.log('SQL:', migrationSQL);

  // Use unsafe for raw SQL execution
  await sql.unsafe(migrationSQL);

  console.log('✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
