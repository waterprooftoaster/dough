import type { LayoutItem } from "react-grid-layout";

export type WidgetType = "net-worth";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
}

// Re-export the library's LayoutItem so callers don't need to import from react-grid-layout
export type { LayoutItem };
