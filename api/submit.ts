import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { x_username, comment_link, post_link, quote_link, wallet_address, referred_by } = body;

    // Validate required fields
    if (!x_username || !comment_link || !post_link || !quote_link || !wallet_address) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate EVM wallet
    const evmRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!evmRegex.test(wallet_address)) {
      return new Response(JSON.stringify({ error: "Invalid EVM wallet address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if username already submitted
    const existing = await sql`SELECT id FROM submissions WHERE x_username = ${x_username.toLowerCase()}`;
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: "This X username has already submitted" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if wallet already submitted
    const existingWallet = await sql`SELECT id FROM submissions WHERE wallet_address = ${wallet_address.toLowerCase()}`;
    if (existingWallet.length > 0) {
      return new Response(JSON.stringify({ error: "This wallet has already submitted" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert submission
    await sql`
      INSERT INTO submissions (x_username, comment_link, post_link, quote_link, wallet_address, referred_by)
      VALUES (
        ${x_username.toLowerCase()},
        ${comment_link},
        ${post_link},
        ${quote_link},
        ${wallet_address.toLowerCase()},
        ${referred_by?.toLowerCase() || null}
      )
    `;

    // If referred, increment the referrer's points
    if (referred_by) {
      await sql`
        UPDATE submissions SET ref_points = ref_points + 1
        WHERE x_username = ${referred_by.toLowerCase()}
      `;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Welcome to the circus",
        ref_code: x_username.toLowerCase(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Submit error:", err);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


