"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

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

export default function Home() {
  const [ratings, setRatings] = useState({});
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [ratingHistory, setRatingHistory] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const photoParam = params.get("photo");
      if (photoParam !== null) {
        const photoIndex = parseInt(photoParam, 10);
        if (!isNaN(photoIndex) && photoIndex >= 0 && photoIndex < photos.length) {
          setCurrentPhotoIndex(photoIndex);
          const photoKey = String(photoIndex);
          setRatingHistory((prev) => {
            if (!prev.includes(photoKey)) {
              return [...prev, photoKey];
            }
            return prev;
          });
          const newUrl = window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        }
      }
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("photoRatings");
    if (stored) {
      setRatings(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("photoRatings", JSON.stringify(ratings));
  }, [ratings]);

  const handleRating = (criterionId, value) => {
    const photoKey = String(currentPhotoIndex);
    const newRatings = { ...ratings };
    if (!newRatings[photoKey]) {
      newRatings[photoKey] = {};
    }
    newRatings[photoKey][criterionId] = value;
    setRatings(newRatings);

    setTimeout(() => {
      const updatedPhotoRatings = newRatings[photoKey];
      const allCriteriaRated = criteria.every(
        (criterion) => updatedPhotoRatings[criterion.id] !== undefined
      );

      if (allCriteriaRated) {
        setRatingHistory((prevHistory) => {
          const newHistory = prevHistory.includes(photoKey)
            ? prevHistory
            : [...prevHistory, photoKey];
          return newHistory;
        });

        const ratedIndices = new Set(
          Object.keys(newRatings).filter((key) => {
            const photoRatings = newRatings[key];
            return (
              photoRatings &&
              criteria.every(
                (criterion) => photoRatings[criterion.id] !== undefined
              )
            );
          })
        );
        if (ratedIndices.size < photos.length) {
          const nextIndex = photos.findIndex(
            (_, index) => !ratedIndices.has(String(index))
          );
          if (nextIndex !== -1) {
            setCurrentPhotoIndex(nextIndex);
            window.scrollTo(0, 0);
          }
        }
      }
    }, 1000);
  };

  const handlePrevious = () => {
    if (ratingHistory.length > 0) {
      const previousIndex = ratingHistory[ratingHistory.length - 1];
      setCurrentPhotoIndex(previousIndex);
      setRatingHistory(ratingHistory.slice(0, -1));
      window.scrollTo(0, 0);
    }
  };

  const currentPhotoRatings = ratings[String(currentPhotoIndex)] || {};

  const allRated =
    Object.keys(ratings).filter((key) => {
      const photoRatings = ratings[key];
      return (
        photoRatings &&
        criteria.every((criterion) => photoRatings[criterion.id] !== undefined)
      );
    }).length === photos.length;
  const hasPrevious = ratingHistory.length > 0;

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
                xmlns="http://www.w3.org/2000/svg"
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
          <h1 className="text-2xl font-semibold text-black">
            Все фото оценены
          </h1>
          <Link
            href="/rating-history"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Посмотреть историю оценок
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-6"></div>
          <h1 className="text-lg font-semibold text-black">Оценка работ</h1>
          <Link href="/rating-history" className="text-black">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
            src={photos[currentPhotoIndex].url}
            alt={photos[currentPhotoIndex].title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <p className="text-gray-400 text-sm px-4 py-2">
          {photos[currentPhotoIndex].title}
        </p>

        <div className="px-4 py-6 space-y-6">
          {criteria.map((criterion) => {
            const criterionRating = currentPhotoRatings[criterion.id] || null;

            return (
              <div key={criterion.id} className="space-y-4">
                <label className="block text-black font-medium">
                  {criterion.name}
                </label>

                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleRating(criterion.id, num)}
                      className={`w-12 h-12 rounded-lg font-medium transition-colors ${
                        criterionRating === num
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-black"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto px-4 pb-8">
          <button
            onClick={handlePrevious}
            disabled={!hasPrevious}
            className={`w-full py-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
              hasPrevious
                ? "bg-black text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
