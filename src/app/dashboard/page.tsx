import { getNetWorthData } from "@/src/lib/db";
import { DashboardContent } from "@/src/components/dashboard-content";

export default async function Dashboard() {
  const data = await getNetWorthData();

  return (
    <main className="p-6">
      <DashboardContent data={data} />
    </main>
  );
}