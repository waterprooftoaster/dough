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


async function aggregateTransactions( prisma: PrismaClient, plaidItem: PlaidItem){
  let allTransactions: PlaidTransaction[] = [];
  let hasMore = true;
  let nextCursor = plaidItem.transactionCursor ?? "";
  console.log(`Starting transaction sync for item: ${plaidItem.itemId}...`);

  // Keep fetching transactions until we get them all
  while (hasMore) {
    console.log("Fetching transactions with cursor:", nextCursor);
    const response = await plaidClient.transactionsSync({
      access_token: plaidItem.accessToken,
      cursor : nextCursor,
      count: 500,
      options: {
        include_original_description: true,
        include_personal_finance_category: true,
      },
    });
    console.log("Plaid API Response:", {
      added: response.data.added.length,
      modified: response.data.modified.length,
      removed: response.data.removed.length,
      has_more: response.data.has_more,
    });
    if (response.data.has_more === false){
      await prisma.plaidItem.update({
        where: {id: plaidItem.id},
        data: {
          transactionCursor: response.data.next_cursor
        }
      })
    }
    hasMore = response.data.has_more;
    nextCursor = response.data.next_cursor;
  }
}

async function parseTransactions(){
  // parse by account
}