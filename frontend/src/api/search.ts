import { apiGet } from "./client";
import type { Software } from "../types";

export async function searchApps(
  term: string,
  country: string,
  entity: string,
  limit: number = 25,
): Promise<Software[]> {
  const params = new URLSearchParams({
    term,
    country,
    entity: entity === "iPad" ? "iPadSoftware" : "software",
    limit: String(limit),
  });
  return apiGet<Software[]>(`/api/search?${params}`);
}

export async function lookupApp(
  bundleId: string,
  country: string,
): Promise<Software | null> {
  const params = new URLSearchParams({ bundleId, country });
  return apiGet<Software | null>(`/api/lookup?${params}`);
}

// Reverse-DNS identifiers like com.example.app: no spaces, at least one dot
export function looksLikeBundleId(term: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9-]*(\.[A-Za-z0-9-]+)+$/.test(term.trim());
}

export async function searchUnified(
  term: string,
  country: string,
  entity: string,
  limit: number = 25,
): Promise<Software[]> {
  const trimmed = term.trim();
  if (looksLikeBundleId(trimmed)) {
    const app = await lookupApp(trimmed, country);
    if (app) return [app];
  }
  return searchApps(trimmed, country, entity, limit);
}
