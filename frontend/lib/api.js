const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const USE_MOCK = true;

const mockUsers = [
  { id: "user-1", name: "Иван Петров", email: "admin@example.com", role: "admin" },
  { id: "jury-1", name: "Анна Сидорова", email: "anna@example.com", role: "jury" },
  { id: "jury-2", name: "Петр Иванов", email: "petr@example.com", role: "jury" },
  { id: "jury-3", name: "Мария Козлова", email: "maria@example.com", role: "jury" },
];

export const mockUser = mockUsers[0];

const mockContests = {
  "1": {
    id: "1",
    name: "Большая Уральская Тропа 2025",
    description: "Ежегодный фотоконкурс природы Урала",
    nominations: ["Пейзаж", "Фауна", "Флора", "Аэрофото", "Туризм"],
    criteria: [
      { id: "originality", name: "Оригинальность" },
      { id: "composition", name: "Композиция" },
      { id: "technical", name: "Техническое качество" },
    ],
    submissionDeadline: "2025-02-15T23:59:59",
    ratingDeadline: "2025-03-01T23:59:59",
    jury: [mockUsers[1], mockUsers[2]],
    adminId: "user-1",
  },
  "2": {
    id: "2",
    name: "Природа России 2024",
    description: "Всероссийский конкурс пейзажной фотографии",
    nominations: ["Горы", "Реки", "Леса"],
    criteria: [
      { id: "originality", name: "Оригинальность" },
      { id: "composition", name: "Композиция" },
    ],
    submissionDeadline: "2024-12-01T23:59:59",
    ratingDeadline: "2024-12-15T23:59:59",
    jury: [mockUsers[1]],
    adminId: "user-1",
  },
};

const mockEntries = {
  "1": [
    {
      id: "entry-1",
      contestId: "1",
      title: "Рассвет в горах",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
      nomination: "Пейзаж",
      author: { fullName: "Алексей Смирнов", email: "alex@mail.ru", phone: "+7 999 123-45-67" },
      ratings: {
        "jury-1": { originality: 8, composition: 9, technical: 7 },
        "jury-2": { originality: 9, composition: 8, technical: 8 },
      },
    },
    {
      id: "entry-2",
      contestId: "1",
      title: "Лесной ручей",
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200",
      nomination: "Пейзаж",
      author: { fullName: "Ольга Новикова", email: "olga@mail.ru", phone: "+7 999 234-56-78" },
      ratings: {
        "jury-1": { originality: 7, composition: 8, technical: 9 },
      },
    },
    {
      id: "entry-3",
      contestId: "1",
      title: "Горный пейзаж",
      url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200",
      nomination: "Пейзаж",
      author: { fullName: "Дмитрий Волков", email: "dmitry@mail.ru", phone: "+7 999 345-67-89" },
      ratings: {},
    },
    {
      id: "entry-4",
      contestId: "1",
      title: "Олень на поляне",
      url: "https://images.unsplash.com/photo-1484406566174-9da000fda645?w=1200",
      nomination: "Фауна",
      author: { fullName: "Елена Кузнецова", email: "elena@mail.ru", phone: "+7 999 456-78-90" },
      ratings: {
        "jury-1": { originality: 9, composition: 9, technical: 8 },
        "jury-2": { originality: 8, composition: 9, technical: 9 },
      },
    },
    {
      id: "entry-5",
      contestId: "1",
      title: "Полевые цветы",
      url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200",
      nomination: "Флора",
      author: { fullName: "Наталья Морозова", email: "nataly@mail.ru", phone: "+7 999 567-89-01" },
      ratings: {
        "jury-1": { originality: 7, composition: 7, technical: 8 },
        "jury-2": { originality: 8, composition: 7, technical: 7 },
      },
    },
  ],
  "2": [
    {
      id: "entry-6",
      contestId: "2",
      title: "Горная река",
      url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200",
      nomination: "Реки",
      author: { fullName: "Сергей Попов", email: "sergey@mail.ru", phone: "+7 999 678-90-12" },
      ratings: {
        "jury-1": { originality: 8, composition: 8 },
      },
    },
  ],
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getContest(contestId) {
  if (USE_MOCK) {
    await delay(200);
    const contest = mockContests[contestId];
    if (!contest) throw new Error("Конкурс не найден");
    return contest;
  }

  const response = await fetch(`${API_BASE_URL}/contests/${contestId}`);
  if (!response.ok) throw new Error("Конкурс не найден");
  return response.json();
}

export async function submitEntry(contestId, data) {
  if (USE_MOCK) {
    await delay(1000);
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

export async function getAdminContests() {
  if (USE_MOCK) {
    await delay(300);
    return Object.values(mockContests).filter((c) => c.adminId === mockUser.id);
  }

  const response = await fetch(`${API_BASE_URL}/admin/contests`);
  if (!response.ok) throw new Error("Ошибка загрузки");
  return response.json();
}

export async function getJuryContests() {
  if (USE_MOCK) {
    await delay(300);
    return Object.values(mockContests).filter((c) =>
      c.jury.some((j) => j.id === mockUser.id || j.email === mockUser.email)
    );
  }

  const response = await fetch(`${API_BASE_URL}/jury/contests`);
  if (!response.ok) throw new Error("Ошибка загрузки");
  return response.json();
}

export async function createContest(data) {
  if (USE_MOCK) {
    await delay(500);
    const id = String(Object.keys(mockContests).length + 1);
    mockContests[id] = { ...data, id, adminId: mockUser.id };
    return { id };
  }

  const response = await fetch(`${API_BASE_URL}/admin/contests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Ошибка создания");
  return response.json();
}

export async function updateContest(contestId, data) {
  if (USE_MOCK) {
    await delay(300);
    if (!mockContests[contestId]) throw new Error("Конкурс не найден");
    mockContests[contestId] = { ...mockContests[contestId], ...data };
    return mockContests[contestId];
  }

  const response = await fetch(`${API_BASE_URL}/admin/contests/${contestId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Ошибка обновления");
  return response.json();
}

export async function getContestEntries(contestId) {
  if (USE_MOCK) {
    await delay(300);
    return mockEntries[contestId] || [];
  }

  const response = await fetch(`${API_BASE_URL}/contests/${contestId}/entries`);
  if (!response.ok) throw new Error("Ошибка загрузки");
  return response.json();
}

export async function getContestResults(contestId) {
  if (USE_MOCK) {
    await delay(300);
    const entries = mockEntries[contestId] || [];
    const contest = mockContests[contestId];
    if (!contest) throw new Error("Конкурс не найден");

    const byNomination = {};
    entries.forEach((entry) => {
      if (!byNomination[entry.nomination]) byNomination[entry.nomination] = [];

      const allRatings = Object.values(entry.ratings);
      const totalScore = allRatings.reduce((sum, r) => {
        return sum + Object.values(r).reduce((s, v) => s + v, 0);
      }, 0);
      const avgScore = allRatings.length > 0 ? totalScore / allRatings.length : 0;

      byNomination[entry.nomination].push({ ...entry, score: avgScore });
    });

    Object.keys(byNomination).forEach((nom) => {
      byNomination[nom].sort((a, b) => b.score - a.score);
      byNomination[nom].forEach((entry, idx) => {
        entry.place = idx + 1;
      });
    });

    return Object.values(byNomination).flat();
  }

  const response = await fetch(`${API_BASE_URL}/admin/contests/${contestId}/results`);
  if (!response.ok) throw new Error("Ошибка загрузки");
  return response.json();
}

export async function searchUsers(query) {
  if (USE_MOCK) {
    await delay(200);
    return mockUsers.filter(
      (u) => u.email.toLowerCase().includes(query.toLowerCase()) ||
        u.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Ошибка поиска");
  return response.json();
}

export async function addJuryMember(contestId, userId) {
  if (USE_MOCK) {
    await delay(200);
    const contest = mockContests[contestId];
    const user = mockUsers.find((u) => u.id === userId);
    if (!contest || !user) throw new Error("Не найдено");
    if (!contest.jury.find((j) => j.id === userId)) {
      contest.jury.push(user);
    }
    return contest;
  }

  const response = await fetch(`${API_BASE_URL}/admin/contests/${contestId}/jury`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) throw new Error("Ошибка добавления");
  return response.json();
}

export async function removeJuryMember(contestId, userId) {
  if (USE_MOCK) {
    await delay(200);
    const contest = mockContests[contestId];
    if (!contest) throw new Error("Конкурс не найден");
    contest.jury = contest.jury.filter((j) => j.id !== userId);
    return contest;
  }

  const response = await fetch(`${API_BASE_URL}/admin/contests/${contestId}/jury/${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Ошибка удаления");
  return response.json();
}

export async function rateEntry(contestId, entryId, ratings) {
  if (USE_MOCK) {
    await delay(300);
    const entries = mockEntries[contestId];
    if (!entries) throw new Error("Конкурс не найден");
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) throw new Error("Работа не найдена");
    entry.ratings[mockUser.id] = ratings;
    return { success: true };
  }

  const response = await fetch(`${API_BASE_URL}/contests/${contestId}/entries/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entryId, ratings }),
  });

  if (!response.ok) throw new Error("Ошибка сохранения");
  return response.json();
}

export async function getJuryEntries(contestId) {
  if (USE_MOCK) {
    await delay(300);
    const entries = mockEntries[contestId] || [];
    return entries.map((e) => ({
      id: e.id,
      title: e.title,
      url: e.url,
      nomination: e.nomination,
      myRatings: e.ratings[mockUser.id] || null,
    }));
  }

  const response = await fetch(`${API_BASE_URL}/jury/contests/${contestId}/entries`);
  if (!response.ok) throw new Error("Ошибка загрузки");
  return response.json();
}
