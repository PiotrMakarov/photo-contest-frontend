"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getJuryContests, mockUser } from "@/lib/api";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getContestStatus(contest) {
  const now = new Date();
  const ratingDeadline = new Date(contest.ratingDeadline);
  return now > ratingDeadline ? "finished" : "active";
}

export default function JuryDashboard() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    getJuryContests()
      .then(setContests)
      .finally(() => setLoading(false));
  }, []);

  const activeContests = contests.filter((c) => getContestStatus(c) === "active");
  const finishedContests = contests.filter((c) => getContestStatus(c) === "finished");

  const displayedContests = activeTab === "active" ? activeContests : finishedContests;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black">Панель жюри</h1>
          <div className="text-sm text-gray-500">{mockUser.name}</div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "active"
                ? "bg-black text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Активные ({activeContests.length})
          </button>
          <button
            onClick={() => setActiveTab("finished")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "finished"
                ? "bg-black text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Завершённые ({finishedContests.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : displayedContests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {activeTab === "active" ? "Нет активных конкурсов" : "Нет завершённых конкурсов"}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedContests.map((contest) => (
              <Link
                key={contest.id}
                href={`/jury/${contest.id}`}
                className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-lg font-semibold text-black mb-2">{contest.name}</h2>
                <p className="text-gray-500 text-sm mb-4">{contest.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Дедлайн оценки: {formatDate(contest.ratingDeadline)}
                  </span>
                  <span className="text-red-600 font-medium">Оценить →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

