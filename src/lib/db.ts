import { PrismaClient } from "@/src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
    }),
  });

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
      include: {
        account: true,
      },
    });
    if (balances.length === 0) {
      return [];
    }

    // Declare the return data
    let data: NetWorthDataPoint[] = [];

    // Get current networth first
    let currNetworth = 0;
    balances.forEach((balance) => {
      const type = balance.account.type;
      if (type === "credit" || type === "loan") {
        currNetworth -= balance.current;
      } else {
        currNetworth += balance.current;
      }
    })

    // Add current net worth to array
    const currDataPoint: NetWorthDataPoint = {
      date: new Date().toISOString(),
      totalNetWorth: currNetworth
    }
    data.unshift(currDataPoint);

    // Now we get all of the days
    let currDate = new Date();
    let timeBack = 30;
    let runningNetWorth = currNetworth;
    for (let i = 0; i < timeBack; i++) {
      currDate.setDate(currDate.getDate() - 1);
      const startOfDay = new Date(currDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(currDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      const transactions = await prisma.transaction.findMany({
        where: {
          date: { gte: startOfDay, lte: endOfDay }
        }
      })

      // Subtract transactions to get balance before that day's transactions
      transactions.forEach((tx) => { runningNetWorth -= tx.amount; })

      // Create and add new data point
      const newDataPoint: NetWorthDataPoint = {
        date: currDate.toISOString(),
        totalNetWorth: runningNetWorth
      }
      data.unshift(newDataPoint);
    }

    return data;

  } catch (error) {
    console.error("Error fetching net worth data:", error);
    return [];
  }
}