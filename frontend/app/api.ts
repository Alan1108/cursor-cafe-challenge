import type { ComparisonResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchCities(): Promise<{ id: string; name: string; slug: string }[]> {
  const res = await fetch(`${API_BASE}/cities`);
  if (!res.ok) throw new Error("Failed to fetch cities");
  return res.json();
}

export async function fetchComparison(
  cityAId: string,
  cityBId: string
): Promise<ComparisonResult> {
  const params = new URLSearchParams({ cityA: cityAId, cityB: cityBId });
  const res = await fetch(`${API_BASE}/comparison?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to compare cities");
  }
  return res.json();
}
