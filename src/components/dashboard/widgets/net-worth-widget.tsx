"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { NetWorthDataPoint } from "@/src/components/dashboard-content";

interface NetWorthWidgetProps {
  data: NetWorthDataPoint[];
}

const chartConfig = {
  totalNetWorth: {
    label: "Net Worth",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function NetWorthWidget({ data }: NetWorthWidgetProps) {
  const formattedData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      displayDate: new Date(point.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-muted-foreground text-sm">
          No balance data available yet.
        </p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <AreaChart data={formattedData} accessibilityLayer>
        <defs>
          <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="displayDate"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelKey="displayDate"
              formatter={(value) =>
                `$${Number(value).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              }
            />
          }
        />
        <Area
          type="monotone"
          dataKey="totalNetWorth"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#colorNetWorth)"
          dot={false}
          isAnimationActive={true}
        />
      </AreaChart>
    </ChartContainer>
  );
}
