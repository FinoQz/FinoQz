export default function StatusMessage({ message, type }: { message: string; type?: string }) {
  if (!message) return null;
  return <p className="mt-6 text-center text-sm text-indigo-600">{message}</p>;
}
