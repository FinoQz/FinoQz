export default function StatusMessage({ message }: { message: string }) {
  if (!message) return null;
  return <p className="mt-6 text-center text-sm text-indigo-600">{message}</p>;
}
