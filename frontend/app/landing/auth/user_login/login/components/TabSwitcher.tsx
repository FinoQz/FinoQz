// components/TabSwitcher.tsx
export default function TabSwitcher({
  activeTab,
  setActiveTab,
}: {
  activeTab: "user" | "admin";
  setActiveTab: (tab: "user" | "admin") => void;
}) {
  return (
    <div className="flex bg-gray-100 rounded-full p-1 mb-4 shadow-sm">
      <button
        className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
          activeTab === "user"
            ? "bg-black text-white shadow"
            : "text-gray-600 hover:text-black"
        }`}
        onClick={() => setActiveTab("user")}
      >
        User Login
      </button>
      <button
        className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
          activeTab === "admin"
            ? "bg-black text-white shadow"
            : "text-gray-600 hover:text-black"
        }`}
        onClick={() => setActiveTab("admin")}
      >
        Admin Login
      </button>
    </div>
  );
}
