import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  console.log("Setting up Jokerz database...");

  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      x_username VARCHAR(255) UNIQUE NOT NULL,
      comment_link VARCHAR(500) NOT NULL,
      post_link VARCHAR(500) NOT NULL,
      quote_link VARCHAR(500) NOT NULL,
      wallet_address VARCHAR(42) NOT NULL,
      referred_by VARCHAR(255),
      ref_points INTEGER DEFAULT 0,
      is_whitelisted BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_wallet ON submissions(wallet_address)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_referrer ON submissions(referred_by)
  `;

  console.log("Database ready. The circus is open.");
}

setup().catch(console.error);
