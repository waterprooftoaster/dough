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
  } 
  catch (error) {
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
  } 
  catch (error) {
    console.warn("Could not fetch institution details", error);
  }

  // Find if plaidItem already exists
  const existingItem = await prisma.plaidItem.findUnique({ where: { itemId: item_id } });
  const accountsResponse = await plaidClient.accountsGet({ access_token });

  // Create new plaidItem if it doesn't exist
  if (!existingItem) {
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
    for (const account of accountsResponse.data.accounts) {
      createAccount(account, item_id);
    }

  // If it exists, update the plaidItem
  } else {
    console.log("PlaidItem already exists, updating...");
    for (const account of accountsResponse.data.accounts) {
      // check if account exists
      const existingAccount = await prisma.account.findUnique({ where: { accountId: account.account_id } });
      if (existingAccount){
        updateAccount(existingAccount, item_id);
      }
      else {
        createAccount(account, item_id);
      }
    }
  }
} // End of POST  
 

// Helper functions 
async function updateAccount(account: any, item_id: string) {
  await prisma.account.update({
    where: {id: account.id},
    data: {
      accountId: account.accountId,
      name: account.name,
      type: account.type,
      subtype: account.subtype || null,
      mask: account.mask || null,
    }
  })
}

async function createAccount(account: any, item_id: string) {
  console.log(`Creating new account: ${account.name} (${account.mask})`)
  const newAccount = await prisma.account.create({
    data: {
      accountId: account.account_id,
      name: account.name,
      type: account.type,
      subtype: account.subtype || null,
      mask: account.mask || null,
      itemId: item_id,
    },
  });
}
