"use client";

import { useEffect, useState } from "react";
import { fetchCities, fetchComparison } from "./api";
import type { City, ComparisonResult } from "./types";

const COST_LABELS: Record<string, string> = {
  rent: "Alquiler (1 hab. fuera centro)",
  food: "Alimentación",
  transport: "Transporte",
  utilities: "Servicios básicos",
  internet: "Internet",
};

function formatUsd(n: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

export default function Home() {
  const [cities, setCities] = useState<City[]>([]);
  const [cityAId, setCityAId] = useState("");
  const [cityBId, setCityBId] = useState("");
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCities()
      .then((list) => {
        setCities(list);
        if (list.length >= 2 && !cityAId && !cityBId) {
          setCityAId(list[0].id);
          setCityBId(list[1].id);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load cities"));
  }, []);

  const handleCompare = () => {
    if (!cityAId || !cityBId || cityAId === cityBId) {
      setError("Selecciona dos ciudades distintas.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    fetchComparison(cityAId, cityBId)
      .then(setResult)
      .catch((e) => setError(e instanceof Error ? e.message : "Error al comparar"))
      .finally(() => setLoading(false));
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-sky-300">
          🇪🇨 Comparador de costo de vida – Ecuador
        </h1>
        <p className="text-slate-400 mt-2">
          Compara gastos mensuales entre ciudades
        </p>
      </header>

      <section className="flex flex-wrap gap-4 items-end justify-center mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Ciudad A
          </label>
          <select
            value={cityAId}
            onChange={(e) => setCityAId(e.target.value)}
            className="bg-slate-800 text-slate-100 border border-slate-600 rounded-lg px-4 py-2 min-w-[220px] focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Ciudad B
          </label>
          <select
            value={cityBId}
            onChange={(e) => setCityBId(e.target.value)}
            className="bg-slate-800 text-slate-100 border border-slate-600 rounded-lg px-4 py-2 min-w-[220px] focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCompare}
          disabled={loading}
          className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? "Comparando…" : "Comparar"}
        </button>
      </section>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {result && (
        <section className="space-y-6">
          <div className="bg-slate-800/80 border border-slate-600 rounded-xl p-4 text-center">
            <p className="text-lg text-slate-200">{result.summaryText}</p>
            <p className="mt-2 text-sky-300 font-semibold">
              Ciudad más económica:{" "}
              {result.moreAffordableCityId === result.cityA.id
                ? result.cityA.name
                : result.cityB.name}
            </p>
          </div>

          <div className="bg-sky-950/40 border border-sky-500/40 rounded-xl p-4">
            <p className="text-sm text-sky-200/90 font-medium mb-1">
              💡 Insight
            </p>
            <p className="text-slate-200 italic">&ldquo;{result.aiInsight ?? "Insight no disponible."}&rdquo;</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-600 bg-slate-800/80">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="px-4 py-3 text-slate-400 font-medium">
                    Concepto
                  </th>
                  <th
                    className={`px-4 py-3 font-medium ${
                      result.moreAffordableCityId === result.cityA.id
                        ? "text-green-400"
                        : "text-slate-200"
                    }`}
                  >
                    {result.cityA.name}
                  </th>
                  <th
                    className={`px-4 py-3 font-medium ${
                      result.moreAffordableCityId === result.cityB.id
                        ? "text-green-400"
                        : "text-slate-200"
                    }`}
                  >
                    {result.cityB.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.cityA.costs &&
                  result.cityB.costs &&
                  (() => {
                    const costsA = result.cityA.costs;
                    const costsB = result.cityB.costs;
                    return (
                      ["rent", "food", "transport", "utilities", "internet"] as const
                    ).map((key) => (
                      <tr
                        key={key}
                        className="border-b border-slate-700 last:border-0"
                      >
                        <td className="px-4 py-3 text-slate-400">
                          {COST_LABELS[key]}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          {formatUsd(Number(costsA[key]))}
                        </td>
                        <td className="px-4 py-3 text-slate-200">
                          {formatUsd(Number(costsB[key]))}
                        </td>
                      </tr>
                    ));
                  })()}
                <tr className="border-t-2 border-sky-500/50 bg-slate-800">
                  <td className="px-4 py-3 font-semibold text-slate-200">
                    Total mensual
                  </td>
                  <td className="px-4 py-3 font-semibold text-sky-300">
                    {formatUsd(result.totalA)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-sky-300">
                    {formatUsd(result.totalB)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
