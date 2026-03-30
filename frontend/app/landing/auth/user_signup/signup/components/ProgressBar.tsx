// components/ProgressBar.tsx
export default function ProgressBar({ step = 1, total = 4 }: { step: number; total: number }) {
  const progress = (step / total) * 100;
  return (
    <div className="text-center mb-6">
      <p className="text-sm text-gray-500">Step {step} of {total}</p>
      <div className="w-64 h-1 bg-gray-200 mt-2">
        <div className="h-full bg-black" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
