"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { getContest, getJuryEntries } from "@/lib/api";

export default function JuryHistoryPage({ params }) {
  const { contestId } = use(params);
  const [contest, setContest] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getContest(contestId), getJuryEntries(contestId)])
      .then(([contestData, entriesData]) => {
        setContest(contestData);
        setEntries(entriesData.filter((e) => e.myRatings));
      })
      .finally(() => setLoading(false));
  }, [contestId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href={`/jury/${contestId}`} className="text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-black">История оценок</h1>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6">
        {entries.length === 0 ? (
          <div className="text-center text-gray-500 py-12">Нет оценённых работ</div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const avgRating =
                Object.values(entry.myRatings).reduce((a, b) => a + b, 0) /
                contest.criteria.length;

              return (
                <div
                  key={entry.id}
                  className="bg-gray-50 rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="relative w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={entry.url}
                      alt={entry.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-black truncate mb-1">{entry.title}</h3>
                    <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                      {entry.nomination}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-2">
                      {contest.criteria.map((criterion) => (
                        <span key={criterion.id} className="text-xs text-gray-600">
                          {criterion.name}: {entry.myRatings[criterion.id] || "-"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-semibold text-black">
                      {avgRating.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">среднее</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

