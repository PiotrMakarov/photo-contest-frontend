"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminContests, getContestEntries, mockUser } from "@/lib/api";

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

export default function AdminDashboard() {
  const [contests, setContests] = useState([]);
  const [entryCounts, setEntryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    getAdminContests()
      .then(async (contestsData) => {
        setContests(contestsData);

        const counts = {};
        await Promise.all(
          contestsData.map(async (c) => {
            const entries = await getContestEntries(c.id);
            const ratedCount = entries.filter((e) =>
              Object.keys(e.ratings || {}).length > 0
            ).length;
            counts[c.id] = { total: entries.length, rated: ratedCount };
          })
        );
        setEntryCounts(counts);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeContests = contests.filter((c) => getContestStatus(c) === "active");
  const finishedContests = contests.filter((c) => getContestStatus(c) === "finished");
  const displayedContests = activeTab === "active" ? activeContests : finishedContests;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black">Панель администратора</h1>
          <div className="text-sm text-gray-500">{mockUser.name}</div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
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

          <Link
            href="/admin/contests/new"
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Создать конкурс
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : displayedContests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {activeTab === "active" ? "Нет активных конкурсов" : "Нет завершённых конкурсов"}
            </p>
            {activeTab === "active" && (
              <Link
                href="/admin/contests/new"
                className="text-red-600 font-medium hover:underline"
              >
                Создать первый конкурс
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedContests.map((contest) => {
              const counts = entryCounts[contest.id] || { total: 0, rated: 0 };
              const now = new Date();
              const submissionOpen = now < new Date(contest.submissionDeadline);
              const ratingOpen = now < new Date(contest.ratingDeadline);

              return (
                <Link
                  key={contest.id}
                  href={`/admin/contests/${contest.id}`}
                  className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-lg font-semibold text-black">{contest.name}</h2>
                    <div className="flex gap-2">
                      {submissionOpen && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Приём работ
                        </span>
                      )}
                      {ratingOpen && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Оценка
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mb-4">{contest.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <span className="text-gray-400">Дедлайн подачи:</span>
                      <span className="ml-2 text-black">{formatDate(contest.submissionDeadline)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Дедлайн оценки:</span>
                      <span className="ml-2 text-black">{formatDate(contest.ratingDeadline)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <span>
                        <span className="text-gray-400">Работ:</span>
                        <span className="ml-1 font-medium text-black">{counts.total}</span>
                      </span>
                      <span>
                        <span className="text-gray-400">Оценено:</span>
                        <span className="ml-1 font-medium text-black">{counts.rated}</span>
                      </span>
                      <span>
                        <span className="text-gray-400">Жюри:</span>
                        <span className="ml-1 font-medium text-black">{contest.jury?.length || 0}</span>
                      </span>
                    </div>
                    <span className="text-red-600 font-medium">Управление →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

