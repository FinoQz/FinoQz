import React from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function MobileInput({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
      <div className="flex items-center border border-gray-300 rounded focus-within:ring-2 focus-within:ring-indigo-500">
        {/* Fixed +91 prefix */}
        <span className="px-3 py-2 bg-gray-100 text-gray-700 text-sm flex items-center gap-1">
          🇮🇳 +91
        </span>
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="98705 54210"
          className="flex-1 px-3 py-2 outline-none text-sm"
        />
      </div>
    </div>
  );
}
