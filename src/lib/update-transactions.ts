import { Account, PlaidItem, PrismaClient } from "@prisma/client";
import { plaidClient } from "./plaid-client";
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Transaction as PlaidTransaction,
  InvestmentTransaction,
  Security,
} from "plaid";

export async function downloadTransactions(
  prisma: PrismaClient,
  account: Account & { plaidItem: PlaidItem; }) 
{
  getTransactions(prisma, account);
}






async function getTransactions(
  prisma: PrismaClient,
  account: Account & {
    plaidItem: PlaidItem; }) 
{
  let allTransactions: PlaidTransaction[] = [];
  let hasMore = true;
  let cursor: string | undefined = undefined;

  console.log("Starting transaction sync for account:", account.id);

  // Keep fetching transactions until we get them all
  while (hasMore) {
    console.log("Fetching transactions with cursor:", cursor);
    const response = await plaidClient.transactionsSync({
      access_token: account.plaidItem.accessToken,
      cursor,
      count: 500,
      options: {
        include_original_description: true,
        include_personal_finance_category: true,
        account_id: account.plaidItemId,
      },
    });
    console.log("Plaid API Response:", {
      added: response.data.added.length,
      modified: response.data.modified.length,
      removed: response.data.removed.length,
      has_more: response.data.has_more,
    });
    hasMore = response.data.has_more;
    cursor = response.data.next_cursor;
  }
}