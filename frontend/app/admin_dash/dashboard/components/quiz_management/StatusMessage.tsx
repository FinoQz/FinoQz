import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function StatusMessage({ message, type }: { message: string; type?: string }) {
  if (!message) return null;
  const isError = type === 'error';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium ${
      isError
        ? 'bg-red-50 border-red-200 text-red-700'
        : 'bg-green-50 border-green-200 text-green-700'
    }`}>
      {isError
        ? <AlertCircle className="w-4 h-4 shrink-0" />
        : <CheckCircle2 className="w-4 h-4 shrink-0" />
      }
      <span>{message}</span>
    </div>
  );
}
