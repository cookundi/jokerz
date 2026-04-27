import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: Request) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("q")?.toLowerCase() || "";

    let rows;

    if (search) {
      rows = await sql`
        SELECT x_username, wallet_address, ref_points, is_whitelisted, created_at
        FROM submissions
        WHERE x_username ILIKE ${"%" + search + "%"}
           OR wallet_address ILIKE ${"%" + search + "%"}
        ORDER BY ref_points DESC, created_at ASC
        LIMIT 100
      `;
    } else {
      rows = await sql`
        SELECT x_username, wallet_address, ref_points, is_whitelisted, created_at
        FROM submissions
        ORDER BY ref_points DESC, created_at ASC
        LIMIT 200
      `;
    }

    return new Response(JSON.stringify({ entries: rows, total: rows.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Entries error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch entries" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = { path: "/api/entries" };
