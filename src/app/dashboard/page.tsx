import { getNetWorthData } from "@/src/lib/networth";
import { NetworthGraph } from "@/src/components/networth-graph";
import { Header } from "@/src/components/header";

export default async function Dashboard() {
  const data = await getNetWorthData();

  return (
    <>
      <Header />
      <main className="p-6">
        <NetworthGraph data={data} />
      </main>
    </>
  )
}