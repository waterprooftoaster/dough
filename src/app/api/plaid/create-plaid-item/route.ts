import { NextResponse } from "next/server";
import { plaidClient } from "@/src/lib/plaid-client";
import { prisma } from "@/src/lib/prisma-client";
import { updateTransactions } from "@/src/lib/transactions";
import {
  CountryCode,
  Institution
} from "plaid";

export async function POST(request: Request) {
  // Read public token from the client
  const { public_token } = await request.json();
  console.log("Exchanging public token...");

  // Exchange public token for access token & item id
  let access_token: string = "";
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
    return NextResponse.json(
      { error: "Failed to exchange public token" },
      { status: 500 }
    );
  }

  // Get institution details or let it remain null
  let institution: Institution | null = null;
  try {
    const itemResponse = await plaidClient.itemGet({ access_token });
    const institutionId = itemResponse.data.item.institution_id ?? "";
    if (institutionId.length === 0) {
      console.warn("No institution ID found for item");
    }
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
      options: { include_optional_metadata: true },
    });
    institution = institutionResponse.data.institution ?? null;
    console.log(`Fetched institution details, id: ${institution.institution_id} name: ${institution.name}`);
  }
  catch (error) {
    console.warn("Could not fetch institution details", error);
  }

  // Check for existing institution in DB before creating new PlaidItem
  // If existingInstitution(s) are found, delete the old Item(s).
  if (institution?.institution_id) {
    const existingItems = await prisma.plaidItem.findMany({ where: { instId: institution.institution_id } });
    if (existingItems.length > 0) {
      console.log(`Duplicate institution: id: ${institution.institution_id} name: ${institution.name} found, deleting duplicate...`);
      await prisma.plaidItem.deleteMany({ where: { instId: institution.institution_id } });
    }
  }

  // Create PlaidItem in DB
  const accountsResponse = await plaidClient.accountsGet({ access_token });
  console.log(`Creating new plaidItem id=${item_id}...`);
  const newItem = await prisma.plaidItem.create({
    data: {
      itemId: item_id,
      accessToken: access_token,
      instId: institution?.institution_id || null,
      instName: institution?.name || null,
      instLogo: institution?.logo || null
    },
  });

  // Create Accounts in DB
  await Promise.all(
    accountsResponse.data.accounts.map((account) => {
      console.log(`Creating new account: ${account.name} (${account.mask})...`);
      return createAccount(account, newItem.id);
    })
  );

  // Update Transactions and balances for accounts
  console.log(`Getting transactions for plaidItem id=${item_id}...`)
  await updateTransactions(newItem);

  return NextResponse.json({
    success: true,
    message: "Created new Plaiditem",
    institution: institution?.name ?? null,
  });
} // End of POST  

// Helper functions 
async function createAccount(account: any, plaiditemId: string) {
  async function createBalance(account: any, prismaAccountId: string) {
    await prisma.accountBalance.create({
      data: {
        accountId: prismaAccountId,
        current: account.balances.current || 0,
        available: account.balances.available || null,
        limit: account.balances.limit || null,
      },
    });
  }
  const newAccount = await prisma.account.create({
    data: {
      accountId: account.account_id,
      name: account.name,
      type: account.type,
      subtype: account.subtype || null,
      mask: account.mask || null,
      plaidItemId: plaiditemId,
    },
  });
  await createBalance(account, newAccount.id)
}