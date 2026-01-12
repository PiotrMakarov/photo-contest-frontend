"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { getContest, getContestResults } from "@/lib/api";

function getMedalColor(place) {
  if (place === 1) return "bg-yellow-400";
  if (place === 2) return "bg-gray-300";
  if (place === 3) return "bg-amber-600";
  return "bg-gray-100";
}

function getMedalText(place) {
  if (place === 1) return "text-yellow-900";
  if (place === 2) return "text-gray-700";
  if (place === 3) return "text-amber-900";
  return "text-gray-600";
}

export default function ContestResultsPage({ params }) {
  const { id } = use(params);
  const [contest, setContest] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nominationFilter, setNominationFilter] = useState("all");

  useEffect(() => {
    Promise.all([getContest(id), getContestResults(id)])
      .then(([contestData, resultsData]) => {
        setContest(contestData);
        setResults(resultsData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const filteredResults =
    nominationFilter === "all"
      ? results
      : results.filter((r) => r.nomination === nominationFilter);

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (nominationFilter === "all") {
      if (a.nomination !== b.nomination) return a.nomination.localeCompare(b.nomination);
    }
    return a.place - b.place;
  });

  const exportCSV = () => {
    const headers = ["Место", "Название", "Автор", "Email", "Телефон", "Номинация", "Балл"];
    const rows = sortedResults.map((r) => [
      r.place,
      r.title,
      r.author?.fullName || "",
      r.author?.email || "",
      r.author?.phone || "",
      r.nomination,
      r.score?.toFixed(1) || "0",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `results-${contest?.name || id}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Конкурс не найден</p>
          <Link href="/admin" className="text-red-600 font-medium">← Назад</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href={`/admin/contests/${id}`} className="text-gray-500 hover:text-black flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-black">Результаты</h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{contest.name}</p>
            </div>
            <button
              onClick={exportCSV}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-1 sm:gap-2 flex-shrink-0 text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M3 14V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V14M10 3V12M10 12L6 8M10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Экспорт</span> CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setNominationFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              nominationFilter === "all"
                ? "bg-black text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Все номинации
          </button>
          {contest.nominations.map((nom) => (
            <button
              key={nom}
              onClick={() => setNominationFilter(nom)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                nominationFilter === nom
                  ? "bg-black text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {nom}
            </button>
          ))}
        </div>

        {sortedResults.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Нет результатов</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {sortedResults.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${getMedalColor(entry.place)} ${getMedalText(entry.place)}`}
                      >
                        {entry.place}
                      </span>
                    </div>
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={entry.url} alt="" fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-black truncate">{entry.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{entry.author?.fullName || "—"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {entry.nomination}
                        </span>
                        <span className="text-sm font-semibold text-black">{entry.score?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="text-gray-600">{entry.author?.email || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Телефон</span>
                      <span className="text-gray-600">{entry.author?.phone || "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-16">Место</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-20">Фото</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Название</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Автор</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Телефон</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Номинация</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 w-20">Балл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedResults.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getMedalColor(entry.place)} ${getMedalText(entry.place)}`}
                        >
                          {entry.place}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative w-16 h-12 bg-gray-100 rounded overflow-hidden">
                          <Image src={entry.url} alt="" fill className="object-cover" unoptimized />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-black font-medium">{entry.title}</td>
                      <td className="px-4 py-3 text-sm text-black">{entry.author?.fullName || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{entry.author?.email || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{entry.author?.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {entry.nomination}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-black">{entry.score?.toFixed(1) || "0"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

