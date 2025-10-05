import { NextResponse } from "next/server";
import { plaidClient } from "@/src/lib/plaid";
import { prisma } from "@/src/lib/db";
import { CountryCode } from "plaid";

// to remove: plaiditem created for the same institution and with the same credentials will 
// return a different item_id each time. this is done on purpose. 
// no need for update and just create a new one each time.

// to add: delete the old item if new one has the same institutionid
// transcations, balances, etc

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


  // Find if institution already exists
  const existingItem = await prisma.plaidItem.find({ where: { institutionId: institutionId } });
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
    await Promise.all(
      accountsResponse.data.accounts.map((account) => createAccount(account, newItem.id))
    );


  // If it exists, update the plaidItem
  } else {
    console.log("PlaidItem already exists, updating...");
    await Promise.all(
      accountsResponse.data.accounts.map(async (account) => {
        // Check if account exists, update if so, create if not
        const existingAccount = await prisma.account.findUnique({ where: { accountId: account.account_id } });
        if (existingAccount){
          try{
            await updateAccount(existingAccount, account);
            console.log('Updated accoun${account.name} (${account.mask}');
          }
          catch(error){
            console.error(`Error updating account ${account.name} (${account.mask}):`, error);
          }
        } else {
          try{
          await createAccount(account, existingItem.id);
          console.log(`Updated account ${account.name} (${account.mask}`);
          }
          catch(error){
            console.error(`Error creating account ${account.name} (${account.mask}):`, error);
          }
        }
      })
    )
  }
  return NextResponse.json({ success: true });
} // End of POST  
 

// Helper functions 
async function createPlaidItem(accountId: string, balance: any) {
  
}

async function updateAccount(existingAccount: any, account: any) {
  console.log(`Updading account: ${account.name} (${account.mask})`)
  await prisma.account.update({
    where: {id: existingAccount.id},
    data: {
      accountId: account.account_id,
      name: account.name,
      type: account.type,
      subtype: account.subtype || null,
      mask: account.mask || null,
    }
  })
}

async function createAccount(account: any, plaiditemId: string) {
  console.log(`Creating new account: ${account.name} (${account.mask})`)
  const newAccount = await prisma.account.create({
    data: {
      accountId: account.account_id,
      name: account.name,
      type: account.type,
      subtype: account.subtype || null,
      mask: account.mask || null,
      itemId: plaiditemId,
    },
  });
}
