"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const nominations = ["Пейзаж", "Фауна", "Флора", "Аэрофото", "Туризм"];

export default function SubmitEntry() {
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [workTitle, setWorkTitle] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <Image
            src="/gut-logo.png"
            alt="БУТ"
            width={150}
            height={150}
            className="object-contain"
          />
        </div>

        <h1 className="text-3xl font-semibold text-center mb-8">
          Отправить работу
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="ФИО"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <input
              type="text"
              placeholder="Название работы"
              value={workTitle}
              onChange={(e) => setWorkTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-black mb-3 font-medium">
              Номинация
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg">
              {nominations.map((nomination) => (
                <button
                  key={nomination}
                  type="button"
                  onClick={() => setSelectedNomination(nomination)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedNomination === nomination
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {nomination}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block w-full">
              <div className="px-4 py-3 bg-gray-100 rounded-lg border-0 cursor-pointer flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-600"
                >
                  <path
                    d="M15.8333 8.33333V14.1667C15.8333 16.0076 14.3409 17.5 12.5 17.5C10.6591 17.5 9.16667 16.0076 9.16667 14.1667V5.83333C9.16667 4.45262 10.286 3.33333 11.6667 3.33333C13.0474 3.33333 14.1667 4.45262 14.1667 5.83333V13.3333"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-gray-500">
                  {photo ? photo.name : "Загрузите фото..."}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            {photoPreview && (
              <div className="mt-4 relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-red-700 transition-colors"
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}
