const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const mockContests = {
  "1": {
    id: "1",
    name: "Большая Уральская Тропа 2025",
    nominations: ["Пейзаж", "Фауна", "Флора", "Аэрофото", "Туризм"],
  },
  "2": {
    id: "2",
    name: "Природа России",
    nominations: ["Горы", "Реки", "Леса"],
  },
};

const USE_MOCK = true;

export async function getContest(contestId) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const contest = mockContests[contestId];
    if (!contest) {
      throw new Error("Конкурс не найден");
    }
    return contest;
  }

  const response = await fetch(`${API_BASE_URL}/contests/${contestId}`);
  if (!response.ok) {
    throw new Error("Конкурс не найден");
  }
  return response.json();
}

export async function submitEntry(contestId, data) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Mock submission:", { contestId, ...data });
    return { success: true, entryId: Math.random().toString(36).slice(2) };
  }

  const response = await fetch(`${API_BASE_URL}/contests/${contestId}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Ошибка отправки");
  }

  return response.json();
}

