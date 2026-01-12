"use client";

export default function PhotoUploader({ photo, preview, onPhotoChange }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoChange(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
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
          onChange={handleChange}
          className="hidden"
        />
      </label>
      {preview && (
        <div className="mt-4 relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

