"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const photos = [
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
    title: "Фото в горах",
  },
  {
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200",
    title: "Пейзаж",
  },
  {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200",
    title: "Лес",
  },
];

const criteria = [
  { id: "originality", name: "Оригинальность" },
  { id: "composition", name: "Композиция" },
  { id: "technical", name: "Техническое качество" },
];

export default function RatingHistory() {
  const [ratings, setRatings] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("photoRatings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRatings(parsed || {});
      } catch (e) {
        console.error("Error parsing ratings:", e);
        setRatings({});
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (Object.keys(ratings).length > 0) {
      localStorage.setItem("photoRatings", JSON.stringify(ratings));
    }
  }, [ratings]);

  const ratedPhotos = useMemo(() => {
    if (!isLoaded || !ratings || Object.keys(ratings).length === 0) {
      return [];
    }
    
    const result = Object.keys(ratings)
      .filter((key) => {
        const photoRatings = ratings[key];
        if (!photoRatings || typeof photoRatings !== "object" || Array.isArray(photoRatings)) {
          return false;
        }
        const allRated = criteria.every(
          (criterion) => {
            const value = photoRatings[criterion.id];
            return value !== undefined && value !== null && typeof value === "number";
          }
        );
        return allRated;
      })
      .map((key) => {
        const num = parseInt(key, 10);
        return isNaN(num) ? null : num;
      })
      .filter((num) => num !== null && num >= 0 && num < photos.length)
      .sort((a, b) => b - a);
    
    return result;
  }, [ratings, isLoaded]);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-black">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
        {!isLoaded ? (
          <div className="text-center text-gray-500 py-12">Загрузка...</div>
        ) : ratedPhotos.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            Нет оцененных работ
          </div>
        ) : (
          <div className="space-y-4">
            {ratedPhotos.map((photoIndex) => {
              const photoRatings = ratings[String(photoIndex)] || {};
              const avgRating =
                Object.values(photoRatings).reduce((a, b) => a + b, 0) /
                criteria.length;

              return (
                <button
                  key={photoIndex}
                  onClick={() => {
                    router.push(`/?photo=${photoIndex}`);
                  }}
                  className="w-full bg-gray-50 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="relative w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={photos[photoIndex].url}
                      alt={photos[photoIndex].title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="font-medium text-black truncate mb-1">
                      {photos[photoIndex].title}
                    </h3>
                    <div className="flex flex-col gap-0.5">
                      {criteria.map((criterion) => (
                        <span
                          key={criterion.id}
                          className="text-xs text-gray-600 truncate"
                        >
                          {criterion.name}: {photoRatings[criterion.id] || "-"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="text-base font-semibold text-black">
                      {avgRating.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      среднее
                    </div>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400 flex-shrink-0"
                  >
                    <path
                      d="M7.5 15L12.5 10L7.5 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

