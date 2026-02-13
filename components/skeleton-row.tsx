"use client";

import { cn } from "@/lib/utils";

interface SkeletonRowProps {
  /**
   * Number of columns to render placeholders for (including checkbox column if present)
   */
  columns: number;
}

export function SkeletonRow({ columns }: SkeletonRowProps) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className={cn("px-3 py-3")}>
          <div
            className={cn(
              "h-4 rounded-full bg-gray-200 dark:bg-gray-800",
              idx === 0 && "w-4",
              idx > 0 && "w-24"
            )}
          />
        </td>
      ))}
    </tr>
  );
}

