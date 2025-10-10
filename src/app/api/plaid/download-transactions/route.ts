import { NextResponse } from 'next/server'
import { PlaidItem } from "@prisma/client";
import { plaidClient } from "@/src/lib/plaid-client";
import { prisma } from "@/src/lib/db";
import {
  Transaction,
  InvestmentTransaction,
  Security,
} from "plaid";

export async function POST(request: Request) {
  // Get transactions by bank
  // One bank many have multiple items
  const { institution_id } = await request.json();
  const plaidItems = await prisma.plaidItem.findMany({ where: { institutionId: institution_id } })
  await Promise.all(
    plaidItems.map((item) => aggregateTransactions(item))
  )
  return NextResponse.json({ success: true })
}

async function aggregateTransactions(plaidItem: PlaidItem) {
  // Get all transactions
  const addedTx: Transaction[] = [];
  const removedTx: Transaction[] = [];
  const moddedTx: Transaction[] = [];
  let hasMore = true;
  let nextCursor = plaidItem.transactionCursor ?? ""; // Start at "bookmark"
  console.log(`Starting transaction sync for item: ${plaidItem.itemId}...`);
  // Reference: https://plaid.com/docs/transactions/
  while (hasMore) {
    console.log("Fetching transactions with cursor:", nextCursor);
    let transactionResponse: any = null;
    try {
      transactionResponse = await plaidClient.transactionsSync({
        access_token: plaidItem.accessToken,
        cursor: nextCursor,
        count: 500,
        options: {
          include_original_description: true,
          include_personal_finance_category: true,
        },
      });
      // Logs
      console.log("Plaid API Response:", {
        added: transactionResponse.data.added?.length ?? 0,
        modified: transactionResponse.data.modified?.length ?? 0,
        removed: transactionResponse.data.removed?.length ?? 0,
        has_more: transactionResponse.data.has_more,
      });
    }
    catch (error) {
      console.warn(`Unable to transactionSync item: ${plaidItem.itemId}`, error);
      break; // Stop on error
    }
    const data = transactionResponse.data;

    // Accumulate results from this page
    if (Array.isArray(data.added) && data.added.length) addedTx.push(...data.added as Transaction[]);
    if (Array.isArray(data.removed) && data.removed.length) removedTx.push(...data.removed as Transaction[]);
    if (Array.isArray(data.modified) && data.modified.length) moddedTx.push(...data.modified as Transaction[]);
    hasMore = !!data.has_more;
    nextCursor = data.next_cursor ?? nextCursor;

    // Save "bookmark" once reading finished
    if (!hasMore) {
      await prisma.plaidItem.update({
        where: { id: plaidItem.id },
        data: { transactionCursor: data.next_cursor }
      });
    }
  }

  // Modify transactions in DB accordingly
  for (const tx of addedTx) { await createTransaction(tx); }
  for (const tx of removedTx) { await removeTransaction(tx); }
  for (const tx of moddedTx) { await updateTransaction(tx); }
}

// Helper funcs
async function createTransaction(tx: Transaction) {
  const existingTx = await prisma.transaction.findUnique({ where: { transactionId: tx.transaction_id } })
  if (existingTx) { console.log(`Transaction id=${tx.transaction_id} already exists`); }
  else {
    console.log(`Creating transaction for ${tx.account_id}`)
    await prisma.transaction.create({
      data: {
        accountId: tx.account_id,
        transactionId: tx.transaction_id,
        date: tx.date ? new Date(tx.date) : new Date(),
        name: tx.name ?? "",
        amount: typeof tx.amount === 'number' ? tx.amount : 0,
        category: Array.isArray(tx.category) ? tx.category.join(' > ') : (tx.category?.[0] ?? null),
        merchantName: tx.merchant_name ?? null,
        pending: !!tx.pending,
      }
    })
  }
}

async function removeTransaction(tx: Transaction) {
  const existingTx = await prisma.transaction.findUnique({ where: { transactionId: tx.transaction_id } });
  if (existingTx) {
    console.log(`Removing transaction id=${tx.transaction_id}`)
    await prisma.transaction.delete({ where: { id: existingTx.id } });
  } else { console.warn(`Could not find transaction ${tx.transaction_id} for removal`) }
}

async function updateTransaction(tx: Transaction) {
  const existingTx = await prisma.transaction.findUnique({ where: { transactionId: tx.transaction_id } });
  if (existingTx) {
    await prisma.transaction.update({
      where: { id: existingTx.id },
      data: {
        name: tx.name ?? existingTx.name,
        amount: typeof tx.amount === 'number' ? tx.amount : existingTx.amount,
        pending: typeof tx.pending === 'boolean' ? tx.pending : existingTx.pending,
        date: tx.date ? new Date(tx.date) : existingTx.date,
      }
    });
  } else { console.warn(`Could not find transaction ${tx.transaction_id} for modification`) }
}


// Investment accounts handled differently