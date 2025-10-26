// components/InputField.tsx
import React from "react";

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
      />
    </div>
  );
}
