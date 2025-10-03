import { NextResponse } from "next/server";
import { plaidClient } from "@/src/lib/plaid";
import { prisma } from "@/src/lib/db";
import { CountryCode } from "plaid";

export async function POST(request: Request) {
  try {
    // Read public token from the client
    const { public_token } = await request.json();
    console.log("Exchanging public token...");

    // Exchange public token for access token & item id
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const access_token = exchangeResponse.data.access_token;
    const item_id = exchangeResponse.data.item_id;
    console.log("Public token exchanged for access token.", { item_id });

    // Get item details (may include institution_id)
    const itemResponse = await plaidClient.itemGet({ access_token });
    const institutionId = itemResponse.data.item?.institution_id ?? null;

    // Try to fetch institution details (name, logo)
    let institutionName: string | null = null;
    let institutionLogo: string | null = null;
    if (institutionId) {
      try {
        const instRes = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: [CountryCode.Us],
        });
        institutionName = instRes.data.institution?.name ?? null;
        // institution logo may be nested; guard access
        institutionLogo = (instRes.data.institution as any)?.logo?.url ?? null;
      } catch (err) {
        console.warn("Could not fetch institution details", err);
      }
    }

    // Fetch accounts for this item
    const accountsRes = await plaidClient.accountsGet({ access_token });
    const plaidAccounts = accountsRes.data.accounts ?? [];

    // Normalize account data for Prisma
    const accountsData = plaidAccounts.map((a: any) => ({
      plaidId: a.account_id as string,
      name: (a.name as string) ?? "",
      nickname: (a.official_name as string) ?? null,
      type: (a.type as string) ?? "",
      subtype: (a.subtype as string) ?? null,
      mask: (a.mask as string) ?? null,
      metadata: JSON.stringify(a),
    }));

    // Create or update the PlaidItem and accounts in the database.
    const existing = await prisma.plaidItem.findUnique({ where: { itemId: item_id } });

    if (!existing) {
      const created = await prisma.plaidItem.create({
        data: {
          itemId: item_id,
          accessToken: access_token,
          institutionId: institutionId ?? "",
          institutionName,
          institutionLogo,
          accounts: {
            create: accountsData.map((acc) => ({
              plaidId: acc.plaidId,
              name: acc.name,
              nickname: acc.nickname,
              type: acc.type,
              subtype: acc.subtype,
              mask: acc.mask,
              metadata: acc.metadata,
            })),
          },
        },
        include: { accounts: true },
      });

      console.log(`Created PlaidItem ${created.id} with ${created.accounts.length} accounts`);
      return NextResponse.json({ ok: true, created: true, itemId: created.id });
    }

    // If the item already exists, update the access token and upsert accounts
    await prisma.plaidItem.update({
      where: { id: existing.id },
      data: {
        accessToken: access_token,
        institutionId: institutionId ?? existing.institutionId,
        institutionName: institutionName ?? existing.institutionName,
        institutionLogo: institutionLogo ?? existing.institutionLogo,
      },
    });

    for (const acc of accountsData) {
      await prisma.account.upsert({
        where: { plaidId: acc.plaidId },
        update: {
          name: acc.name,
          nickname: acc.nickname,
          type: acc.type,
          subtype: acc.subtype,
          mask: acc.mask,
          metadata: acc.metadata,
          itemId: existing.id,
        },
        create: {
          plaidId: acc.plaidId,
          name: acc.name,
          nickname: acc.nickname,
          type: acc.type,
          subtype: acc.subtype,
          mask: acc.mask,
          metadata: acc.metadata,
          itemId: existing.id,
        },
      });
    }

    console.log(`Updated PlaidItem ${existing.id} and upserted ${accountsData.length} accounts`);
    return NextResponse.json({ ok: true, created: false, itemId: existing.id });
  } catch (error) {
    console.error("Error exchanging token:", error);
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
  }
}