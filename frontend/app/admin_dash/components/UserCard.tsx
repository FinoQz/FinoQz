export default function UserCard({
  user,
  onAction,
}: {
  user: {
    _id: string;
    fullName: string;
    email: string;
    mobile?: string;
    createdAt: string;
  };
  onAction: (id: string, action: 'approve' | 'reject') => void;
}) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="font-semibold text-lg">{user.fullName}</h2>
        <p className="text-sm text-gray-600">{user.email}</p>
        <p className="text-sm text-gray-600">📱 {user.mobile}</p>
        <p className="text-sm text-gray-600">🕒 {new Date(user.createdAt).toLocaleString()}</p>
      </div>
      <div className="mt-4 md:mt-0 flex gap-3">
        <button
          onClick={() => onAction(user._id, 'approve')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Approve
        </button>
        <button
          onClick={() => onAction(user._id, 'reject')}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
