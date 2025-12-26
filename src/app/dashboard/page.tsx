import { getNetWorthData } from "@/src/lib/networth";
import { DashboardContent } from "@/src/components/dashboard-content";
import { Header } from "@/src/components/header";

export default async function Dashboard() {
  const data = await getNetWorthData();

  return (
    <>
      <Header />
      <main className="p-6">
        <DashboardContent data={data} />
      </main>
      );
    </>
  )
}