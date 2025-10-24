import { NextResponse } from 'next/server'
import { PlaidItem } from "@prisma/client";
import { plaidClient } from "@/src/lib/plaid-client";
import { prisma } from "@/src/lib/db";
import {
  Transaction,
  InvestmentTransaction,
  Security,
} from "plaid";

export async function aggregateTransactions(plaidItem: PlaidItem) {
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
    let txResponse: any = null;
    try {
      txResponse = await plaidClient.transactionsSync({
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
        added: txResponse.data.added?.length ?? 0,
        modified: txResponse.data.modified?.length ?? 0,
        removed: txResponse.data.removed?.length ?? 0,
        has_more: txResponse.data.has_more,
      });
    }
    catch (error) {
      console.warn(`Unable to transactionSync item: ${plaidItem.itemId}`, error);
      break; // Stop on error
    }
    const data = txResponse.data;

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
  for (const tx of addedTx) {
    console.log(`Creating ${addedTx.length} transactions`)
    await createTransaction(tx);
  }
  for (const tx of removedTx) {
    console.log(`Removing ${removedTx.length} transactions`)
    await removeTransaction(tx);
  }
  for (const tx of moddedTx) {
    console.log(`Updating ${moddedTx.length} transactions`)
    await updateTransaction(tx);
  }
}

// Helper funcs
async function createTransaction(tx: Transaction) {
  const existingTx = await prisma.transaction.findUnique({ where: { transactionId: tx.transaction_id } })
  const account = await prisma.account.findUnique({ where: { accountId: tx.account_id } })
  if (existingTx) {
    console.log(`Transaction id=${tx.transaction_id} already exists`);
  }
  if (!account) {
    console.error(`Transaction id=${tx.transaction_id} does not have an associated account`)
  }
  else {
    await prisma.transaction.create({
      data: {
        accountId: account.id,
        transactionId: tx.transaction_id,
        date: new Date(tx.date),
        name: tx.name,
        amount: tx.amount,
        category: tx.category ? tx.category[0] : null,
        merchantName: tx.merchant_name,
        pending: tx.pending,
        // Additional fields
        isoCurrencyCode: tx.iso_currency_code,
        unofficialCurrencyCode: tx.unofficial_currency_code,
        authorizedDate: tx.authorized_date
          ? new Date(tx.authorized_date)
          : null,
        authorizedDatetime: tx.authorized_datetime
          ? new Date(tx.authorized_datetime)
          : null,
        datetime: tx.datetime
          ? new Date(tx.datetime)
          : null,
        paymentChannel: tx.payment_channel,
        transactionCode: tx.transaction_code,
        personalFinanceCategory:
          tx.personal_finance_category?.primary || null,
        merchantEntityId: tx.merchant_entity_id,
        // Location data
        locationAddress: tx.location?.address,
        locationCity: tx.location?.city,
        locationRegion: tx.location?.region,
        locationPostalCode: tx.location?.postal_code,
        locationCountry: tx.location?.country,
        locationLat: tx.location?.lat || null,
        locationLon: tx.location?.lon || null,
        // Payment metadata
        byOrderOf: tx.payment_meta?.by_order_of,
        payee: tx.payment_meta?.payee,
        payer: tx.payment_meta?.payer,
        paymentMethod: tx.payment_meta?.payment_method,
        paymentProcessor: tx.payment_meta?.payment_processor,
        ppd_id: tx.payment_meta?.ppd_id,
        reason: tx.payment_meta?.reason,
        referenceNumber: tx.payment_meta?.reference_number,
      }
    })
  }
}

async function removeTransaction(tx: Transaction) {
  const existingTx = await prisma.transaction.findUnique({ where: { transactionId: tx.transaction_id } });
  if (existingTx) {
    await prisma.transaction.delete({ where: { id: existingTx.id } });
  } else { console.warn(`Could not find transaction ${tx.transaction_id} for removal`) }
}

async function updateTransaction(tx: Transaction) {
  const existingTx = await prisma.transaction.findUnique({ where: { transactionId: tx.transaction_id } });
  if (existingTx) {
    await prisma.transaction.update({
      where: { id: existingTx.id },
      data: {
        date: new Date(tx.date),
        name: tx.name,
        amount: tx.amount,
        category: tx.category ? tx.category[0] : null,
        merchantName: tx.merchant_name,
        pending: tx.pending,
        // Additional fields
        isoCurrencyCode: tx.iso_currency_code,
        unofficialCurrencyCode: tx.unofficial_currency_code,
        authorizedDate: tx.authorized_date
          ? new Date(tx.authorized_date)
          : null,
        authorizedDatetime: tx.authorized_datetime
          ? new Date(tx.authorized_datetime)
          : null,
        datetime: tx.datetime ? new Date(tx.datetime) : null,
        paymentChannel: tx.payment_channel,
        transactionCode: tx.transaction_code,
        personalFinanceCategory:
          tx.personal_finance_category?.primary || null,
        merchantEntityId: tx.merchant_entity_id,
        // Location data
        locationAddress: tx.location?.address,
        locationCity: tx.location?.city,
        locationRegion: tx.location?.region,
        locationPostalCode: tx.location?.postal_code,
        locationCountry: tx.location?.country,
        locationLat: tx.location?.lat || null,
        locationLon: tx.location?.lon || null,
        // Payment metadata
        byOrderOf: tx.payment_meta?.by_order_of,
        payee: tx.payment_meta?.payee,
        payer: tx.payment_meta?.payer,
        paymentMethod: tx.payment_meta?.payment_method,
        paymentProcessor: tx.payment_meta?.payment_processor,
        ppd_id: tx.payment_meta?.ppd_id,
        reason: tx.payment_meta?.reason,
        referenceNumber: tx.payment_meta?.reference_number,
      }
    });
  } else { console.warn(`Could not find transaction ${tx.transaction_id} for modification`) }
}