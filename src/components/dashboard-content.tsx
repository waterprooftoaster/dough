import { prisma } from "@/src/lib/db";
import { NetWorthChart } from "@/src/components/net-worth-chart";

async function getNetWorthData() {
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

export async function DashboardContent() {
  const data = await getNetWorthData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Track your net worth over time</p>
      </div>

      {data.length > 0 ? (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Net Worth Trend</h2>
          <NetWorthChart data={data} />
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-12">
          <p className="text-center text-muted-foreground">
            No balance data available yet. Connect an account to get started.
          </p>
        </div>
      )}
    </div>
  );
}
