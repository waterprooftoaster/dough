"use client";

import { useState, useCallback, useEffect } from "react";
import type { LayoutItem } from "react-grid-layout";
import { WidgetConfig, WidgetType } from "./widget-types";

const STORAGE_KEY = "dough-dashboard-layout";

interface PersistedState {
  widgets: WidgetConfig[];
  layouts: LayoutItem[];
}

const DEFAULT_STATE: PersistedState = {
  widgets: [{ id: "net-worth-default", type: "net-worth" }],
  layouts: [{ i: "net-worth-default", x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 }],
};

function loadFromStorage(): PersistedState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveToStorage(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

function nextPosition(layouts: LayoutItem[]): { x: number; y: number } {
  if (layouts.length === 0) return { x: 0, y: 0 };
  const maxY = Math.max(...layouts.map((l) => l.y + l.h));
  return { x: 0, y: maxY };
}

export function useDashboardLayout() {
  const [state, setState] = useState<PersistedState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(loadFromStorage());
    setMounted(true);
  }, []);

  const addWidget = useCallback((type: WidgetType) => {
    setState((prev) => {
      const id = `${type}-${Date.now()}`;
      const pos = nextPosition(prev.layouts);
      const newWidget: WidgetConfig = { id, type };
      const newLayout: LayoutItem = { i: id, x: pos.x, y: pos.y, w: 6, h: 4, minW: 3, minH: 3 };
      const next = {
        widgets: [...prev.widgets, newWidget],
        layouts: [...prev.layouts, newLayout],
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeWidget = useCallback((id: string) => {
    setState((prev) => {
      const next = {
        widgets: prev.widgets.filter((w) => w.id !== id),
        layouts: prev.layouts.filter((l) => l.i !== id),
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const onLayoutChange = useCallback((newLayouts: readonly LayoutItem[]) => {
    setState((prev) => {
      const next = { ...prev, layouts: [...newLayouts] };
      saveToStorage(next);
      return next;
    });
  }, []);

  return {
    widgets: state.widgets,
    layouts: state.layouts,
    mounted,
    addWidget,
    removeWidget,
    onLayoutChange,
  };
}
