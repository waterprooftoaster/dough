import { NextResponse } from "next/server";
import { plaidClient } from "@/src/lib/plaid-client";
import { CountryCode, Products } from "plaid";

export async function POST() {
  try {
    // Create a new link token
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: "user-id" },
      client_name: "Dough",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      transactions: {
        days_requested: 730, 
      },
      optional_products: [Products.Investments], 
    });
    return NextResponse.json(response.data);
    // Error Handling
  } catch (error) {
    console.error("Error creating link token:", error);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }
}
