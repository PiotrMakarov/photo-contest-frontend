"use client";

import { useState } from "react";
import Image from "next/image";
import { submitEntry } from "@/lib/api";
import TextInput from "@/components/TextInput";
import ChipSelect from "@/components/ChipSelect";
import PhotoUploader from "@/components/PhotoUploader";

export default function SubmitEntryForm({ contest }) {
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [workTitle, setWorkTitle] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoChange = (file, preview) => {
    setPhoto(file);
    setPhotoPreview(preview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!fullName || !email || !workTitle || !selectedNomination || !photo) {
      setSubmitError("Заполните все поля");
      return;
    }

    setSubmitting(true);

    try {
      await submitEntry(contest.id, {
        fullName,
        email,
        workTitle,
        nomination: selectedNomination,
        photo: photoPreview,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
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
            Работа отправлена!
          </h1>
          <p className="text-gray-500">
            Мы свяжемся с вами по указанному email
          </p>
        </div>
      </div>
    );
  }

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

        <h1 className="text-3xl font-semibold text-center mb-2">
          Отправить работу
        </h1>
        <p className="text-gray-500 text-center mb-8">{contest.name}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <TextInput
              placeholder="ФИО"
              value={fullName}
              onChange={setFullName}
            />
            <TextInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
            />
            <TextInput
              placeholder="Название работы"
              value={workTitle}
              onChange={setWorkTitle}
            />
          </div>

          <ChipSelect
            label="Номинация"
            options={contest.nominations}
            selected={selectedNomination}
            onSelect={setSelectedNomination}
          />

          <PhotoUploader
            photo={photo}
            preview={photoPreview}
            onPhotoChange={handlePhotoChange}
          />

          {submitError && (
            <div className="text-red-600 text-sm text-center">{submitError}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Отправка..." : "Отправить"}
          </button>
        </form>
      </div>
    </div>
  );
}

