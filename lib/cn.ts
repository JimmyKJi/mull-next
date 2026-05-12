import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// `cn` — combine class names, then de-conflict Tailwind utilities.
//
// Why both libraries: clsx handles conditional class composition
// (truthy strings, arrays, objects). tailwind-merge resolves
// conflicts within Tailwind utility groups so that e.g.
// cn("p-4", isWide && "p-8") collapses to just "p-8" instead of
// shipping both classes (which would cause the cascade to depend on
// declaration order in the stylesheet).
//
// Use this on every component that conditionally applies Tailwind
// utility classes. Skip it for static class lists — the merge step
// has a small cost.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
