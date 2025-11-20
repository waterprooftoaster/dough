import { updateTransactions } from '@/src/lib/transactions';
import { NextResponse } from 'next/server'
import { PlaidItem } from "@prisma/client";
import { prisma } from "@/src/lib/db";

export async function POST(request: Request) {
  // Get transactions by bank. If no institution details provided, sync all items.
  // One bank may have multiple items
  let body: any = {};
  try { body = await request.json(); }
  catch (error) { body = {}; }
  const institution_id = body?.institution_id ?? null;
  const institution_name = body?.institution_name ?? null;

  let plaidItems: PlaidItem[] = [];
  if (institution_id) {
    plaidItems = await prisma.plaidItem.findMany({ where: { instId: institution_id } });
  }
  if (institution_name) {
    plaidItems = await prisma.plaidItem.findMany({ where: { instName: institution_name } });
  }
  else {
    // Sync all items
    plaidItems = await prisma.plaidItem.findMany();
  }
  plaidItems.forEach((item) => { updateTransactions(item); });

  return NextResponse.json({ success: true, itemsSynced: plaidItems.length });
}

// Investment accounts handled differently