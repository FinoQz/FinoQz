import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function PasswordInput({ value, onChange }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
      <div className="flex items-center border border-gray-300 rounded focus-within:ring-2 focus-within:ring-indigo-500">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Create a strong password"
          className="flex-1 px-4 py-2 outline-none text-sm"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="px-3 py-2 text-gray-600 hover:text-black"
        >
          {show ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
