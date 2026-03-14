"use client";

import { useDashboardLayout } from "@/src/components/dashboard/use-dashboard-layout";
import { DashboardGrid } from "@/src/components/dashboard/dashboard-grid";
import { AddWidgetMenu } from "@/src/components/dashboard/add-widget-menu";

export interface NetWorthDataPoint {
  date: string;
  totalNetWorth: number;
}

interface DashboardContentProps {
  data: NetWorthDataPoint[];
}

export function DashboardContent({ data }: DashboardContentProps) {
  const { widgets, layouts, mounted, addWidget, removeWidget, onLayoutChange } =
    useDashboardLayout();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Track your net worth over time</p>
      </div>

      <AddWidgetMenu addWidget={addWidget}>
        <div className="min-h-[500px]">
          {mounted && (
            <DashboardGrid
              data={data}
              widgets={widgets}
              layouts={layouts}
              removeWidget={removeWidget}
              onLayoutChange={onLayoutChange}
            />
          )}
        </div>
      </AddWidgetMenu>
    </div>
  );
}
