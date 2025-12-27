"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { NetWorthDataPoint } from "../lib/networth";

const chartConfig = {
  totalNetWorth: {
    label: "Net Worth",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function NetworthGraph({ data }: { data: NetWorthDataPoint[] }) {
  return (
    <div className="space-y-6">
      {data.length > 0 ? (
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Net Worth Trend</h2>
          {Plot(data)}
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

function Plot(data: NetWorthDataPoint[]) {
  const formattedData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      displayDate: new Date(point.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [data]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
      <AreaChart data={formattedData} accessibilityLayer>
        <defs>
          <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--chart-1)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--chart-1)"
              stopOpacity={0.1}
            />
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
          tickFormatter={(value) =>
            `$${(value / 1000).toFixed(0)}k`
          }
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