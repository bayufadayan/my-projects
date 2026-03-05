import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id          TEXT    PRIMARY KEY,
      title       TEXT    NOT NULL,
      description TEXT,
      live_url    TEXT,
      github_url  TEXT,
      tags        TEXT[],
      created_at  BIGINT  NOT NULL
    )
  `;
}

export default sql;
