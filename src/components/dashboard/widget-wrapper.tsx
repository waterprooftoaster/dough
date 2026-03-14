"use client";

import { X, GripVertical } from "lucide-react";

interface WidgetWrapperProps {
  id: string;
  title: string;
  onRemove: (id: string) => void;
  children: React.ReactNode;
}

export function WidgetWrapper({ id, title, onRemove, children }: WidgetWrapperProps) {
  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden group">
      {/* Header / drag handle */}
      <div className="drag-handle flex items-center justify-between px-4 py-3 border-b border-border cursor-grab active:cursor-grabbing shrink-0">
        <div className="flex items-center gap-2">
          <GripVertical className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-sm p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
          aria-label="Remove widget"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 min-h-0">
        {children}
      </div>
    </div>
  );
}
