"use client";

export default function ChipSelect({ label, options, selected, onSelect }) {
  return (
    <div>
      {label && <label className="block text-black mb-3 font-medium">{label}</label>}
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selected === option
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

