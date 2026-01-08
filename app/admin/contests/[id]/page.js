"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getContest,
  getContestEntries,
  updateContest,
  searchUsers,
  addJuryMember,
  removeJuryMember,
} from "@/lib/api";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toLocalDatetime(dateStr) {
  const d = new Date(dateStr);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function ContestManagePage({ params }) {
  const { id } = use(params);
  const [contest, setContest] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [nominationFilter, setNominationFilter] = useState("all");

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const [jurySearch, setJurySearch] = useState("");
  const [juryResults, setJuryResults] = useState([]);

  useEffect(() => {
    Promise.all([getContest(id), getContestEntries(id)])
      .then(([contestData, entriesData]) => {
        setContest(contestData);
        setEntries(entriesData);
        setEditData({
          name: contestData.name,
          description: contestData.description || "",
          submissionDeadline: toLocalDatetime(contestData.submissionDeadline),
          ratingDeadline: toLocalDatetime(contestData.ratingDeadline),
          nominations: [...contestData.nominations],
          criteria: contestData.criteria.map((c) => ({ ...c })),
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSearchJury = async (query) => {
    setJurySearch(query);
    if (query.length < 2) {
      setJuryResults([]);
      return;
    }
    const results = await searchUsers(query);
    setJuryResults(results.filter((u) => !contest.jury.find((j) => j.id === u.id)));
  };

  const handleAddJury = async (user) => {
    await addJuryMember(id, user.id);
    setContest({ ...contest, jury: [...contest.jury, user] });
    setJurySearch("");
    setJuryResults([]);
  };

  const handleRemoveJury = async (userId) => {
    await removeJuryMember(id, userId);
    setContest({ ...contest, jury: contest.jury.filter((j) => j.id !== userId) });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const updated = await updateContest(id, {
        name: editData.name,
        description: editData.description,
        submissionDeadline: new Date(editData.submissionDeadline).toISOString(),
        ratingDeadline: new Date(editData.ratingDeadline).toISOString(),
        nominations: editData.nominations.filter((n) => n.trim()),
        criteria: editData.criteria.filter((c) => c.name.trim()),
      });
      setContest(updated);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
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

  const now = new Date();
  const submissionOpen = now < new Date(contest.submissionDeadline);
  const ratingOpen = now < new Date(contest.ratingDeadline);

  const filteredEntries =
    nominationFilter === "all"
      ? entries
      : entries.filter((e) => e.nomination === nominationFilter);

  const tabs = [
    { id: "overview", label: "Обзор" },
    { id: "entries", label: `Работы (${entries.length})` },
    { id: "jury", label: `Жюри (${contest.jury?.length || 0})` },
    { id: "settings", label: "Настройки" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/admin" className="text-gray-500 hover:text-black flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-black truncate">{contest.name}</h1>
              <div className="flex gap-2 mt-1">
                {submissionOpen && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Приём работ</span>
                )}
                {ratingOpen && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Оценка</span>
                )}
                {!ratingOpen && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Завершён</span>
                )}
              </div>
            </div>
            <Link
              href={`/admin/contests/${id}/results`}
              className="bg-red-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm flex-shrink-0"
            >
              Результаты
            </Link>
          </div>

          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-black">{entries.length}</div>
                <div className="text-gray-500 text-xs sm:text-sm">Работ подано</div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-black">
                  {entries.filter((e) => Object.keys(e.ratings || {}).length > 0).length}
                </div>
                <div className="text-gray-500 text-xs sm:text-sm">Работ оценено</div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-black">{contest.jury?.length || 0}</div>
                <div className="text-gray-500 text-xs sm:text-sm">Членов жюри</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="font-semibold text-black mb-4">Информация</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 flex-shrink-0">Дедлайн подачи</span>
                  <span className="text-black text-right">{formatDate(contest.submissionDeadline)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 flex-shrink-0">Дедлайн оценки</span>
                  <span className="text-black text-right">{formatDate(contest.ratingDeadline)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-gray-500 flex-shrink-0">Номинации</span>
                  <span className="text-black sm:text-right">{contest.nominations.join(", ")}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-gray-500 flex-shrink-0">Критерии</span>
                  <span className="text-black sm:text-right">{contest.criteria.map((c) => c.name).join(", ")}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="font-semibold text-black mb-4">Ссылка для участников</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? `${window.location.origin}/contest/${id}/submit` : ""}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm min-w-0"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/contest/${id}/submit`)}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 flex-shrink-0"
                >
                  Копировать
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "entries" && (
          <div>
            <div className="mb-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setNominationFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  nominationFilter === "all" ? "bg-black text-white" : "bg-white text-gray-600"
                }`}
              >
                Все
              </button>
              {contest.nominations.map((nom) => (
                <button
                  key={nom}
                  onClick={() => setNominationFilter(nom)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    nominationFilter === nom ? "bg-black text-white" : "bg-white text-gray-600"
                  }`}
                >
                  {nom}
                </button>
              ))}
            </div>

            {filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Нет работ</div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3">
                      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={entry.url} alt="" fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-black truncate">{entry.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{entry.author?.fullName}</p>
                        <p className="text-xs text-gray-400 truncate">{entry.author?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {entry.nomination}
                          </span>
                          <span className="text-xs text-gray-500">
                            {Object.keys(entry.ratings || {}).length}/{contest.jury?.length || 0}
                          </span>
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
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Фото</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Название</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Автор</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Номинация</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Оценки</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="relative w-16 h-12 bg-gray-100 rounded overflow-hidden">
                              <Image src={entry.url} alt="" fill className="object-cover" unoptimized />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-black">{entry.title}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="text-black">{entry.author?.fullName}</div>
                            <div className="text-gray-400 text-xs">{entry.author?.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {entry.nomination}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {Object.keys(entry.ratings || {}).length} / {contest.jury?.length || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "jury" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-black mb-4">Добавить члена жюри</h2>
              <div className="relative">
                <input
                  type="text"
                  value={jurySearch}
                  onChange={(e) => handleSearchJury(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Поиск по email или имени"
                />
                {juryResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-48 overflow-auto">
                    {juryResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleAddJury(user)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-black">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <span className="text-red-600 text-sm">Добавить</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {contest.jury?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Жюри не добавлено</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {contest.jury?.map((member) => {
                    const ratedCount = entries.filter((e) => e.ratings?.[member.id]).length;
                    return (
                      <div key={member.id} className="px-4 py-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-black">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            Оценено: {ratedCount} / {entries.length}
                          </span>
                          <button
                            onClick={() => handleRemoveJury(member.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-black">Настройки конкурса</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-red-600 font-medium text-sm"
                >
                  Редактировать
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  disabled={!editMode}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  disabled={!editMode}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дедлайн подачи</label>
                  <input
                    type="datetime-local"
                    value={editData.submissionDeadline}
                    onChange={(e) => setEditData({ ...editData, submissionDeadline: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дедлайн оценки</label>
                  <input
                    type="datetime-local"
                    value={editData.ratingDeadline}
                    onChange={(e) => setEditData({ ...editData, ratingDeadline: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Номинации</label>
                <div className="space-y-2">
                  {editData.nominations?.map((nom, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={nom}
                        onChange={(e) => {
                          const updated = [...editData.nominations];
                          updated[idx] = e.target.value;
                          setEditData({ ...editData, nominations: updated });
                        }}
                        disabled={!editMode}
                        className="flex-1 px-4 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                      />
                      {editMode && editData.nominations.length > 1 && (
                        <button
                          onClick={() => {
                            setEditData({
                              ...editData,
                              nominations: editData.nominations.filter((_, i) => i !== idx),
                            });
                          }}
                          className="px-3 text-gray-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <button
                      onClick={() => setEditData({ ...editData, nominations: [...editData.nominations, ""] })}
                      className="text-red-600 text-sm font-medium"
                    >
                      + Добавить номинацию
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Критерии оценки</label>
                <div className="space-y-2">
                  {editData.criteria?.map((crit, idx) => (
                    <div key={crit.id} className="flex gap-2">
                      <input
                        type="text"
                        value={crit.name}
                        onChange={(e) => {
                          const updated = [...editData.criteria];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setEditData({ ...editData, criteria: updated });
                        }}
                        disabled={!editMode}
                        className="flex-1 px-4 py-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                      />
                      {editMode && editData.criteria.length > 1 && (
                        <button
                          onClick={() => {
                            setEditData({
                              ...editData,
                              criteria: editData.criteria.filter((_, i) => i !== idx),
                            });
                          }}
                          className="px-3 text-gray-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <button
                      onClick={() =>
                        setEditData({
                          ...editData,
                          criteria: [...editData.criteria, { id: crypto.randomUUID(), name: "" }],
                        })
                      }
                      className="text-red-600 text-sm font-medium"
                    >
                      + Добавить критерий
                    </button>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {saving ? "Сохранение..." : "Сохранить"}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditData({
                        name: contest.name,
                        description: contest.description || "",
                        submissionDeadline: toLocalDatetime(contest.submissionDeadline),
                        ratingDeadline: toLocalDatetime(contest.ratingDeadline),
                        nominations: [...contest.nominations],
                        criteria: contest.criteria.map((c) => ({ ...c })),
                      });
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

