import { NextResponse } from "next/server";
import { plaidClient } from "@/src/lib/plaid";
import { prisma } from "@/src/lib/db";
import { CountryCode } from "plaid";

export async function POST(request: Request) {
  // Read public token from the client
  const { public_token } = await request.json();
  console.log("Exchanging public token...");

  // Exchange public token for access token & item id
  let access_token: string;
  let item_id: string;
  try {
  const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token });
  const temp_access_token = exchangeResponse.data.access_token;
  const temp_item_id = exchangeResponse.data.item_id;
  access_token = temp_access_token;
  item_id = temp_item_id;
  console.log("Public token exchanged for access token.", { item_id });
  } catch (error) {
    console.error("Error exchanging public token:", error);
    return NextResponse.json({ error: "Failed to exchange public token" }, { status: 500 });
  }

  // Get institution details
  let institutionId : string;
  const itemResponse = await plaidClient.itemGet({ access_token });
  institutionId = itemResponse.data.item.institution_id ?? "";
  let institution: any = null;
  if (institutionId.length === 0 ) { console.warn("No institution ID found for item"); }
  try {
    const instRes = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
      options: { include_optional_metadata: true },
    });
    institution = instRes.data.institution ?? null;
    console.log(`Fetched institution details, id: ${institutionId} name: ${institution.name}`);
  } catch (err) {
    console.warn("Could not fetch institution details", err);
  }

  // Find if plaidItem already exists
  const existing = await prisma.plaidItem.findUnique({ where: { itemId: item_id } });

  // Create new plaidItem if it doesn't exist
  if (!existing) {
    console.log("Creating new PlaidItem...");
    const newItem = await prisma.plaidItem.create({
      data: {
        itemId: item_id,
        accessToken: access_token,
        institutionId : institutionId,
        institutionName: institution?.name,
        institutionLogo: institution?.logo,
      },
    });
    const accountsResponse = await plaidClient.accountsGet({ access_token });
    for (const account of accountsResponse.data.accounts) {
      console.log(`Creating new account: ${account.name} (${account.mask})`)
      const newAccount = await prisma.account.create({
        data: {
          accountId: account.account_id,
          name: account.name,
          type: account.type,
          subtype: account.subtype || null,
          mask: account.mask || null,
          itemId: newItem.id,
        },
      });
    }

  // if it exists, update the access token
  } else {
    // update account instead 
  }
}

