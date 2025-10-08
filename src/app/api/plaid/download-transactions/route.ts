import { Account, PlaidItem, PrismaClient } from "@prisma/client";
import { plaidClient } from "@/src/lib/plaid-client";
import {
  Transaction as PlaidTransaction,
  InvestmentTransaction,
  Security,
} from "plaid";

export async function POST(request: Request) {
  // Get transactions by bank
  // One bank many have multiple items
  const prisma = new PrismaClient;
  const { institution_id } = await request.json();
  const plaidItems = await prisma.plaidItem.findMany({where: {institutionId: institution_id}})
  await Promise.all(
    plaidItems.map((item)=>aggregateTransactions(prisma, item))
  )
}

async function aggregateTransactions(prisma: PrismaClient, plaidItem: PlaidItem){
  // Aggragate all unseen transactions under item
  let allTransactions: PlaidTransaction[] = [];
  let hasMore = true;
  let nextCursor = plaidItem.transactionCursor ?? ""; // Start at "bookmark"
  console.log(`Starting transaction sync for item: ${plaidItem.itemId}...`);
  // Reference https://plaid.com/docs/transactions/ 
  // next_cursor "booksmarks" transaction timeline
  // has_more returns false if no transactions remain
  while (hasMore) {
    console.log("Fetching transactions with cursor:", nextCursor);
    let transactionResponse : any;
    try {
      const transactionResponse = await plaidClient.transactionsSync({
        access_token: plaidItem.accessToken,
        cursor : nextCursor,
        count: 500,
        options: {
          include_original_description: true,
          include_personal_finance_category: true,
        },
      });
      console.log("Plaid API Response:", {
        added: transactionResponse.data.added.length,
        modified: transactionResponse.data.modified.length,
        removed: transactionResponse.data.removed.length,
        has_more: transactionResponse.data.has_more,
      });
    }
    catch (error) {
      console.warn(`Unable to transactionSync item: ${plaidItem.itemId}` )
    }
    if (transactionResponse.data.has_more === false){
      // Save "bookmark" once reading finished
      await prisma.plaidItem.update({
        where: {id: plaidItem.id},
        data: {
          transactionCursor: transactionResponse.data.next_cursor
        }
      })
    }
    hasMore = transactionResponse.data.has_more; //has_more
    nextCursor = transactionResponse.data.next_cursor; //next_cursor
  }
}

async function parseTransactions(transactions: any[], prisma: PrismaClient, account: Account){
  // parse by account
}

// Investment accounts handled differently