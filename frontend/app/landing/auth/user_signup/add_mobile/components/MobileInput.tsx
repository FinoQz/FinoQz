import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function MobileInput({ value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        Mobile Number
      </label>

      <div className="flex items-center border border-gray-300 rounded-md bg-white transition
                      focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200">

        {/* Country Code */}
        <span className="px-3 py-2 text-sm text-gray-700 bg-gray-50 border-r border-gray-200 font-medium">
          🇮🇳 +91
        </span>

        {/* Input */}
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          className="flex-1 px-3 py-2 outline-none text-sm text-gray-900 bg-transparent"
        />
      </div>

      <p className="text-xs text-gray-500">
        We’ll send a one-time password to this number
      </p>
    </div>
  );
}
