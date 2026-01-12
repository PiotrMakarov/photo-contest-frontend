"use client";

export default function TextInput({ type = "text", placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
    />
  );
}

