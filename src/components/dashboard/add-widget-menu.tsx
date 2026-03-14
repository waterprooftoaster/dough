"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/src/components/ui/context-menu";
import { WidgetType } from "./widget-types";

interface AddWidgetMenuProps {
  addWidget: (type: WidgetType) => void;
  children: React.ReactNode;
}

export function AddWidgetMenu({ addWidget, children }: AddWidgetMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Add Widget</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => addWidget("net-worth")}>
          Net Worth Chart
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
