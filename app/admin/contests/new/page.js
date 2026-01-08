"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createContest, searchUsers, addJuryMember } from "@/lib/api";

export default function NewContestPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [ratingDeadline, setRatingDeadline] = useState("");
  const [nominations, setNominations] = useState([""]);
  const [criteria, setCriteria] = useState([{ id: crypto.randomUUID(), name: "" }]);
  const [jury, setJury] = useState([]);

  const [jurySearch, setJurySearch] = useState("");
  const [juryResults, setJuryResults] = useState([]);
  const [searchingJury, setSearchingJury] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchJury = async (query) => {
    setJurySearch(query);
    if (query.length < 2) {
      setJuryResults([]);
      return;
    }
    setSearchingJury(true);
    try {
      const results = await searchUsers(query);
      setJuryResults(results.filter((u) => !jury.find((j) => j.id === u.id)));
    } finally {
      setSearchingJury(false);
    }
  };

  const addJury = (user) => {
    setJury([...jury, user]);
    setJurySearch("");
    setJuryResults([]);
  };

  const removeJury = (userId) => {
    setJury(jury.filter((j) => j.id !== userId));
  };

  const addNomination = () => setNominations([...nominations, ""]);
  const removeNomination = (idx) => setNominations(nominations.filter((_, i) => i !== idx));
  const updateNomination = (idx, value) => {
    const updated = [...nominations];
    updated[idx] = value;
    setNominations(updated);
  };

  const addCriterion = () => setCriteria([...criteria, { id: crypto.randomUUID(), name: "" }]);
  const removeCriterion = (idx) => setCriteria(criteria.filter((_, i) => i !== idx));
  const updateCriterion = (idx, value) => {
    const updated = [...criteria];
    updated[idx] = { ...updated[idx], name: value };
    setCriteria(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validNominations = nominations.filter((n) => n.trim());
    const validCriteria = criteria.filter((c) => c.name.trim());

    if (!name.trim()) {
      setError("Укажите название конкурса");
      return;
    }
    if (!submissionDeadline || !ratingDeadline) {
      setError("Укажите дедлайны");
      return;
    }
    if (validNominations.length === 0) {
      setError("Добавьте хотя бы одну номинацию");
      return;
    }
    if (validCriteria.length === 0) {
      setError("Добавьте хотя бы один критерий оценки");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createContest({
        name: name.trim(),
        description: description.trim(),
        submissionDeadline: new Date(submissionDeadline).toISOString(),
        ratingDeadline: new Date(ratingDeadline).toISOString(),
        nominations: validNominations,
        criteria: validCriteria.map((c) => ({ id: c.id, name: c.name.trim() })),
        jury: jury,
      });

      router.push(`/admin/contests/${result.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-black">
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
          <h1 className="text-xl font-semibold text-black">Новый конкурс</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black mb-4">Основная информация</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название конкурса
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Например: Фотоконкурс природы 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  placeholder="Краткое описание конкурса"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black mb-4">Дедлайны</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дедлайн подачи работ
                </label>
                <input
                  type="datetime-local"
                  value={submissionDeadline}
                  onChange={(e) => setSubmissionDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дедлайн оценки
                </label>
                <input
                  type="datetime-local"
                  value={ratingDeadline}
                  onChange={(e) => setRatingDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Номинации</h2>
              <button
                type="button"
                onClick={addNomination}
                className="text-red-600 font-medium text-sm hover:underline"
              >
                + Добавить
              </button>
            </div>
            <div className="space-y-3">
              {nominations.map((nom, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => updateNomination(idx, e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Название номинации"
                  />
                  {nominations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNomination(idx)}
                      className="px-3 text-gray-400 hover:text-red-600"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Критерии оценки</h2>
              <button
                type="button"
                onClick={addCriterion}
                className="text-red-600 font-medium text-sm hover:underline"
              >
                + Добавить
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Каждый критерий оценивается от 1 до 10</p>
            <div className="space-y-3">
              {criteria.map((crit, idx) => (
                <div key={crit.id} className="flex gap-2">
                  <input
                    type="text"
                    value={crit.name}
                    onChange={(e) => updateCriterion(idx, e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Название критерия"
                  />
                  {criteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriterion(idx)}
                      className="px-3 text-gray-400 hover:text-red-600"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black mb-4">Жюри</h2>
            <div className="relative mb-4">
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
                      type="button"
                      onClick={() => addJury(user)}
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
              {searchingJury && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
                  Поиск...
                </div>
              )}
            </div>

            {jury.length > 0 && (
              <div className="space-y-2">
                {jury.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <div>
                      <div className="font-medium text-black">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeJury(user.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Создание..." : "Создать конкурс"}
          </button>
        </form>
      </div>
    </div>
  );
}

