import { Account, PlaidItem, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { plaidClient } from "@/src/lib/plaid";
import { prisma } from "@/src/lib/db";
import { CountryCode } from "plaid";

export async function downloadTransactions(
  prisma: PrismaClient,
  account: Account & {
    plaidItem: PlaidItem;
  }
) {
  if (account.type === "investment") {
    return handleInvestmentTransactions(prisma, account);
  } else {
    return handleRegularTransactions(prisma, account);
  }
}


let access_token = PrismaClient.Account.plaidItem.accessToken;

const request = {
  access_token: account.plaidItem.accessToken

}

async function handleRegularTransactions ( 
  prisma: PrismaClient,
  account: Account & {
    plaidItem: PlaidItem; }){
  // placeholder
}

async function handleInvestmentTransactions ( 
  prisma: PrismaClient,
  account: Account & {
    plaidItem: PlaidItem; }){
  try {
    await plaidClient.transactionsSync(request);
}
}