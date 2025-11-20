import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export interface NetWorthDataPoint {
  date: string;
  totalNetWorth: number;
}

export async function getNetWorthData(): Promise<NetWorthDataPoint[]> {
  try {
    // Get all account balances ordered by date
    const balances = await prisma.accountBalance.findMany({
      orderBy: {
        date: "asc",
      },
      include: {
        account: true,
      },
    });

    if (balances.length === 0) {
      return [];
    }

    // Group balances by date and sum them up
    const netWorthByDate = new Map<string, number>();

    balances.forEach((balance) => {
      const dateStr = balance.date.toISOString().split("T")[0]; // YYYY-MM-DD format
      const current = netWorthByDate.get(dateStr) || 0;
      netWorthByDate.set(dateStr, current + balance.current);
    });

    // Convert to array and sort by date
    const data = Array.from(netWorthByDate.entries())
      .map(([date, totalNetWorth]) => ({
        date,
        totalNetWorth,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return data;
  } catch (error) {
    console.error("Error fetching net worth data:", error);
    return [];
  }
}