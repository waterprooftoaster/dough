import { NextResponse } from "next/server";
import { plaidClient } from "@/src/lib/plaid";
import { prisma } from "@/src/lib/db";
import { CountryCode } from "plaid";

export async function POST(request: Request) {
  try {
    // Wait for public token from Plaid link
    const { public_token } = await request.json();
    console.log("Exchanging public token...");

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token, });
    const { access_token, item_id } = exchangeResponse.data;
    console.log("Public token exchanged for access token.");
    
    // Persist the new Plaid item in the database. Use upsert to avoid unique constraint errors
    // The Prisma schema requires institutionId; use the Plaid item_id as a fallback here.
    const saved = await prisma.plaidItem.upsert({
      where: { itemId: item_id },
      update: {
        accessToken: access_token,
        updatedAt: new Date(),
      },
      create: {
        itemId: item_id,
        accessToken: access_token,
        institutionId: item_id,
        provider: 'plaid',
      },
    });

    return NextResponse.json({ success: true, id: saved.id });
  
  } catch (error) {
    console.error("Error exchanging token:", error);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}