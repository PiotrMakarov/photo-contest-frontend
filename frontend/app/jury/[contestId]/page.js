"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { getContest, getJuryEntries, rateEntry } from "@/lib/api";

export default function JuryRatingPage({ params }) {
  const { contestId } = use(params);
  const [contest, setContest] = useState(null);
  const [entries, setEntries] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState({});
  const [ratingHistory, setRatingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getContest(contestId), getJuryEntries(contestId)])
      .then(([contestData, entriesData]) => {
        setContest(contestData);
        setEntries(entriesData);

        const existingRatings = {};
        entriesData.forEach((entry) => {
          if (entry.myRatings) {
            existingRatings[entry.id] = entry.myRatings;
          }
        });
        setRatings(existingRatings);

        const firstUnrated = entriesData.findIndex((e) => !e.myRatings);
        if (firstUnrated !== -1) setCurrentIndex(firstUnrated);
      })
      .finally(() => setLoading(false));
  }, [contestId]);

  const currentEntry = entries[currentIndex];
  const currentRatings = currentEntry ? ratings[currentEntry.id] || {} : {};

  const handleRating = async (criterionId, value) => {
    if (!currentEntry || saving) return;

    const newRatings = {
      ...ratings,
      [currentEntry.id]: {
        ...currentRatings,
        [criterionId]: value,
      },
    };
    setRatings(newRatings);

    const entryRatings = newRatings[currentEntry.id];
    const allRated = contest.criteria.every((c) => entryRatings[c.id] !== undefined);

    if (allRated) {
      setSaving(true);
      try {
        await rateEntry(contestId, currentEntry.id, entryRatings);

        setRatingHistory((prev) =>
          prev.includes(currentIndex) ? prev : [...prev, currentIndex]
        );

        setTimeout(() => {
          const ratedIds = new Set(Object.keys(newRatings).filter((id) => {
            const r = newRatings[id];
            return contest.criteria.every((c) => r[c.id] !== undefined);
          }));

          const nextUnrated = entries.findIndex((e) => !ratedIds.has(e.id));
          if (nextUnrated !== -1 && nextUnrated !== currentIndex) {
            setCurrentIndex(nextUnrated);
            window.scrollTo(0, 0);
          }
        }, 800);
      } finally {
        setSaving(false);
      }
    }
  };

  const handlePrevious = () => {
    if (ratingHistory.length > 0) {
      const prevIndex = ratingHistory[ratingHistory.length - 1];
      setCurrentIndex(prevIndex);
      setRatingHistory(ratingHistory.slice(0, -1));
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!contest || entries.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Нет работ для оценки</p>
          <Link href="/jury" className="text-red-600 font-medium">
            ← Назад к списку
          </Link>
        </div>
      </div>
    );
  }

  const allRated = entries.every((entry) => {
    const r = ratings[entry.id];
    return r && contest.criteria.every((c) => r[c.id] !== undefined);
  });

  if (allRated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                className="text-green-600"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-black">Все работы оценены</h1>
          <div className="space-x-4">
            <Link
              href={`/jury/${contestId}/history`}
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              История оценок
            </Link>
            <Link
              href="/jury"
              className="inline-block bg-gray-100 text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              К списку конкурсов
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/jury" className="text-black">
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
          <h1 className="text-lg font-semibold text-black">Оценка работ</h1>
          <Link href={`/jury/${contestId}/history`} className="text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="relative w-full aspect-[4/3] bg-gray-100">
          <Image
            src={currentEntry.url}
            alt={currentEntry.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="px-4 py-2 flex justify-between items-center">
          <p className="text-gray-400 text-sm">{currentEntry.title}</p>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            {currentEntry.nomination}
          </span>
        </div>

        <div className="px-4 py-6 space-y-6">
          {contest.criteria.map((criterion) => (
            <div key={criterion.id} className="space-y-4">
              <label className="block text-black font-medium">{criterion.name}</label>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleRating(criterion.id, num)}
                    disabled={saving}
                    className={`w-12 h-12 rounded-lg font-medium transition-colors ${
                      currentRatings[criterion.id] === num
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    } disabled:opacity-50`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto px-4 pb-8">
          <button
            onClick={handlePrevious}
            disabled={ratingHistory.length === 0}
            className={`w-full py-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
              ratingHistory.length > 0
                ? "bg-black text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>К предыдущей оценке</span>
          </button>
        </div>
      </div>
    </div>
  );
}

