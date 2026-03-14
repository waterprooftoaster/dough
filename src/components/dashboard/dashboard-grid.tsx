"use client";

import { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import type { Layout, ResponsiveLayouts, LayoutItem } from "react-grid-layout";
import { WidgetWrapper } from "./widget-wrapper";
import { NetWorthWidget } from "./widgets/net-worth-widget";
import { NetWorthDataPoint } from "@/src/components/dashboard-content";
import type { WidgetConfig } from "./widget-types";

const ResponsiveGridLayout = WidthProvider(Responsive);

const ROW_HEIGHT = 80;
const MARGIN = 16;
const CHROME_OFFSET = 200;

const WIDGET_TITLES: Record<string, string> = {
  "net-worth": "Net Worth Trend",
};

interface DashboardGridProps {
  data: NetWorthDataPoint[];
  widgets: WidgetConfig[];
  layouts: LayoutItem[];
  removeWidget: (id: string) => void;
  onLayoutChange: (newLayouts: readonly LayoutItem[]) => void;
}

export function DashboardGrid({
  data,
  widgets,
  layouts,
  removeWidget,
  onLayoutChange,
}: DashboardGridProps) {
  const [maxRows, setMaxRows] = useState(8);

  useEffect(() => {
    setMaxRows(Math.max(4, Math.floor((window.innerHeight - CHROME_OFFSET) / (ROW_HEIGHT + MARGIN))));
  }, []);

  // Fixed pixel height matching maxRows so isBounded has a real boundary to clamp against
  const gridHeight = maxRows * (ROW_HEIGHT + MARGIN) + MARGIN;

  function renderWidget(type: string) {
    if (type === "net-worth") return <NetWorthWidget data={data} />;
    return null;
  }

  return (
    <ResponsiveGridLayout
      layouts={{ lg: layouts, md: layouts } as ResponsiveLayouts}
      breakpoints={{ lg: 1200, md: 768, sm: 480, xs: 0 }}
      cols={{ lg: 12, md: 12, sm: 4, xs: 2 }}
      rowHeight={80}
      draggableHandle=".drag-handle"
      onLayoutChange={(_layout: Layout, allLayouts: ResponsiveLayouts) => {
        const lg = allLayouts["lg"];
        if (lg) onLayoutChange(lg);
      }}
      margin={[16, 16] as const}
      compactType={null}
      maxRows={maxRows}
      isBounded={true}
      style={{ height: gridHeight }}
    >
      {widgets.map((widget) => (
        <div key={widget.id}>
          <WidgetWrapper
            id={widget.id}
            title={WIDGET_TITLES[widget.type] ?? widget.type}
            onRemove={removeWidget}
          >
            {renderWidget(widget.type)}
          </WidgetWrapper>
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
