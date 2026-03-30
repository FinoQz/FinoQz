// components/InputField.tsx
import React, { useRef } from "react";

interface InputFieldProps {
  label?: string;
  value: string;
  onChange: (otp: string) => void;
  length?: number;
}

export default function InputField({
  label,
  value,
  onChange,
  length = 6,
}: InputFieldProps) {
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const otpArray = Array.from({ length }, (_, i) => value[i] ?? "");

  const handleChange = (val: string, index: number) => {
    if (!/^\d?$/.test(val)) return;

    const newOtp = [...otpArray];
    newOtp[index] = val;
    onChange(newOtp.join("").trim());

    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {otpArray.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="
              w-full h-12 sm:h-16
              text-center text-base sm:text-lg font-semibold
              rounded-xl
              bg-gray-50
              border border-gray-300
              shadow-inner
              focus:outline-none
              focus:ring-2 focus:ring-indigo-500
              focus:bg-white
              transition
            "
          />
        ))}
      </div>
    </div>
  );
}
