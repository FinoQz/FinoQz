"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { exportToExcel, exportToJSON, exportToPDF } from "@/utils/exportUtils";
import apiAdmin from "@/lib/apiAdmin";
import { io, Socket } from "socket.io-client";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface AllUser {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  status: "Active" | "Inactive" | "Blocked";
  registrationDate: string;
  lastLogin: string;
  walletBalance?: number;
}

type ModalType = "view" | "edit" | "block" | "unblock" | "delete" | null;

interface ActionModalProps {
  type: ModalType;
  user: AllUser | null;
  editData: {
    fullName: string;
    email: string;
    mobile: string;
  };
  setEditData: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      email: string;
      mobile: string;
    }>
  >;
  onClose: () => void;
  onConfirm: () => void;
}

// ✅ Reusable modal component
function ActionModal({
  type,
  user,
  editData,
  setEditData,
  onClose,
  onConfirm,
}: ActionModalProps) {
  if (!user || !type) return null;

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-[90%] sm:w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {type === "view" && "User Details"}
          {type === "edit" && "Edit User"}
          {type === "block" && "Block User"}
          {type === "unblock" && "Unblock User"}
          {type === "delete" && "Delete User"}
        </h2>

        {type === "view" && (
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Mobile:</strong> {user.mobile || "N/A"}</p>
            <p><strong>Status:</strong> {user.status}</p>
            <p><strong>Registered:</strong> {formatDate(user.registrationDate)}</p>
            <p><strong>Last Login:</strong> {formatDateTime(user.lastLogin)}</p>
          </div>
        )}

        {type === "edit" && (
          <div className="space-y-4">
            <input
              value={editData.fullName}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, fullName: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-xl"
              placeholder="Full Name"
            />
            <input
              value={editData.email}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-xl"
              placeholder="Email"
            />
            <input
              value={editData.mobile}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, mobile: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-xl"
              placeholder="Mobile"
            />
          </div>
        )}

        {(type === "block" || type === "unblock" || type === "delete") && (
          <p className="text-gray-700">
            Are you sure you want to{" "}
            <strong>
              {type} {user.fullName}
            </strong>
            ?
          </p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          {(type === "block" ||
            type === "unblock" ||
            type === "delete" ||
            type === "edit") && (
              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md active:scale-95 ${
                  type === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-[#253A7B] hover:bg-[#1a2b5e] shadow-blue-200'
                }`}
              >
                Confirm
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

export default function AllUsersTable() {
  const [users, setUsers] = useState<AllUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive" | "Blocked">("All");
  
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  
  const [actionPopup, setActionPopup] = useState<{
    userId: string;
    position: { x: number; y: number };
  } | null>(null);
  
  const [activeModal, setActiveModal] = useState<{
    type: ModalType;
    user: AllUser | null;
  }>({ type: null, user: null });
  
  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
    mobile: "",
  });

  const socketRef = useRef<Socket | null>(null);

  // ✅ Server-side Data Fetching
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiAdmin.get("/api/admin/panel/all-users", {
        params: {
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery,
          status: statusFilter
        },
        headers: { "Cache-Control": "no-store" } // To prevent caching stale data
      });
      
      if (res.data && res.data.users) {
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("❌ API failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, searchQuery, statusFilter]);

  // ✅ Debounced Search & Filter Trigger
  useEffect(() => {
    // Reset to page 1 ONLY when search or status changes (handled implicitly by React state if needed, better to handle explicit resetting in the onChange handler)
    const handler = setTimeout(() => {
      fetchUsers();
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [fetchUsers]);

  // Reset to first page when search or status filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // ✅ WebSocket-based Real-Time Triggers
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return;

    if (!socketRef.current) {
      socketRef.current = io(backendUrl, { withCredentials: true });
    }
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket:", socket.id);
    });

    socket.on("users:update", () => {
      console.log("📡 Received users:update, refetching current page...");
      fetchUsers();
    });

    socket.on("disconnect", (reason) => {
      console.warn("❌ WebSocket disconnected:", reason);
    });

    return () => {
      socket.off("users:update");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [fetchUsers]);

  // ...rest of your table rendering logic (search, filter, actions, modals, etc.)
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ Export Functions
  const handleExportPDF = () => {
    exportToPDF(users, "users");
  };

  const handleExportExcel = () => {
    exportToExcel(users, "users");
  };

  const handleExportJSON = () => {
    exportToJSON(users, "users");
  };

  const handleActionClick = (userId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setActionPopup({
      userId,
      position: { x: rect.left, y: rect.bottom + 5 },
    });
  };

  const handleAction = (action: string, userId: string) => {
    const user = users.find((u) => u._id === userId);
    if (!user) return;

    const act = action.toLowerCase();

    if (act === "view") {
      setActiveModal({ type: "view", user });
    }

    if (act === "edit") {
      setEditData({
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile || "",
      });
      setActiveModal({ type: "edit", user });
    }

    if (act === "block") {
      setActiveModal({ type: "block", user });
    }

    if (act === "unblock") {
      setActiveModal({ type: "unblock", user });
    }

    if (act === "delete") {
      setActiveModal({ type: "delete", user });
    }

    setActionPopup(null);
  };

  const handleConfirm = async () => {
    if (!activeModal.user) return;

    const userId = activeModal.user._id;

    try {
      // ✅ EDIT USER
      if (activeModal.type === "edit") {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, ...editData } : u))
        );
        setActiveModal({ type: null, user: null });
        await apiAdmin.put(`/api/admin/panel/user/${userId}`, editData);
      }

      // ✅ BLOCK USER
      if (activeModal.type === "block") {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, status: "Blocked" } : u
          )
        );
        setActiveModal({ type: null, user: null });
        await apiAdmin.post(`/api/admin/panel/user/${userId}/block`);
      }

      // ✅ UNBLOCK USER
      if (activeModal.type === "unblock") {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, status: "Active" } : u
          )
        );
        setActiveModal({ type: null, user: null });
        await apiAdmin.post(`/api/admin/panel/user/${userId}/unblock`);
      }

      // ✅ DELETE USER
      if (activeModal.type === "delete") {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setActiveModal({ type: null, user: null });
        try {
          await apiAdmin.delete(`/api/admin/panel/user/${userId}`);
        } catch {
          // If API fails, revert the optimistic update and show error
          setUsers((prev) => [...prev, activeModal.user!]);
          alert("Failed to delete user. Please try again.");
        }
      }
    } catch (err) {
      console.error("❌ Action failed:", err);
      // Optionally: show a toast or revert optimistic update if needed
    }
  };

  // ✅ Helper to get badge classes based on status
  const getStatusClasses = (status: AllUser["status"]) => {
    if (status === "Active") return "bg-green-50 text-green-700 border border-green-100/50";
    if (status === "Blocked") return "bg-red-50 text-red-700 border border-red-100/50";
    return "bg-slate-50 text-slate-600 border border-slate-100";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ✅ ACTION MODAL */}
      {activeModal.type && (
        <ActionModal
          type={activeModal.type}
          user={activeModal.user}
          editData={editData}
          setEditData={setEditData}
          onClose={() => setActiveModal({ type: null, user: null })}
          onConfirm={handleConfirm}
        />
      )}

      {/* Search + Filter */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4.5 h-4.5 group-focus-within:text-[#253A7B] transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm border border-gray-100 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-[#253A7B]/30 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "All" | "Active" | "Inactive" | "Blocked"
                  )
                }
                className="pl-9 pr-8 py-2.5 text-sm border border-gray-100 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-[#253A7B]/30 transition-all outline-none appearance-none cursor-pointer w-full sm:w-auto font-medium text-gray-600"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-20 bg-gray-50/10">
            <div className="inline-block w-8 h-8 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB]/80 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                    User Name
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                    Registration
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                    Wallet
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] pr-10">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50/50 transition-all duration-300"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-gray-900 font-semibold">
                            {user.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {user.fullName}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.mobile || "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusClasses(
                          user.status
                        )}`}
                      >
                        {user.status === "Active" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : user.status === "Blocked" ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {user.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.registrationDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDateTime(user.lastLogin)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-blue-700">
                        ₹{user.walletBalance ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                      <button
                        onClick={(e) => handleActionClick(user._id, e)}
                        className="p-2 text-gray-400 hover:text-[#253A7B] hover:bg-blue-50 rounded-lg transition-all"
                        title="Actions"
                      >
                        <Edit className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * rowsPerPage, totalCount)}</span> of <span className="font-medium">{totalCount}</span> users
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ MOBILE VIEW (Card layout) */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No users found</p>
          </div>
        ) : (
          <>
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white p-4 rounded-2xl shadow border border-gray-200 overflow-hidden"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md shrink-0">
                      <span className="text-gray-900 font-semibold">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {user.mobile || "N/A"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${getStatusClasses(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                </div>

                <div className="flex justify-between mt-3 text-xs text-gray-500">
                  <span className="truncate">Reg: {formatDate(user.registrationDate)}</span>
                  <span className="truncate">Last: {formatDateTime(user.lastLogin)}</span>
                </div>

                <button
                  onClick={(e) => handleActionClick(user._id, e)}
                  className="mt-3 w-full px-3 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-xl shadow-md transition-all"
                >
                  Actions
                </button>
              </div>
            ))}
            
            {/* Mobile Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-3 py-4 border-t border-gray-200 mt-4">
                <p className="text-xs text-center text-gray-500">
                  Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * rowsPerPage, totalCount)}</span> of <span className="font-medium">{totalCount}</span>
                </p>
                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Popup */}
      {actionPopup && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActionPopup(null)}
          />
          <div
            className="fixed z-50 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-2 w-48 animate-in fade-in zoom-in-95 duration-200"
            style={{
              left: Math.min(
                actionPopup.position.x,
                typeof window !== "undefined" ? window.innerWidth - 200 : 0
              ),
              top: actionPopup.position.y,
            }}
          >
            <button
              onClick={() => handleAction("View", actionPopup.userId)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300"
            >
              <Eye className="w-4 h-4 text-gray-900" />
              View Details
            </button>

            <button
              onClick={() => handleAction("Edit", actionPopup.userId)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300"
            >
              <Edit className="w-4 h-4 text-gray-700" />
              Edit User
            </button>

            <button
              onClick={() =>
                handleAction(
                  users.find((u) => u._id === actionPopup.userId)?.status ===
                    "Blocked"
                    ? "Unblock"
                    : "Block",
                  actionPopup.userId
                )
              }
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded-xl transition-all duration-300"
            >
              <Ban className="w-4 h-4 text-yellow-600" />
              {users.find((u) => u._id === actionPopup.userId)?.status ===
                "Blocked"
                ? "Unblock User"
                : "Block User"}
            </button>

            <button
              onClick={() => handleAction("Delete", actionPopup.userId)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              Delete User
            </button>
          </div>
        </>
      )}

      {/* Export Section */}
      <div className="bg-[#F9FAFB]/50 rounded-xl p-6 border border-gray-200/60 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#253A7B]" />
              Data Intelligence & Export
            </h3>
            <p className="text-xs text-gray-500">
              Download your filtered user results for deep analysis and offline reporting.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {[
              { label: 'Excel (XLSX)', icon: Download, color: 'bg-emerald-600', shadow: 'shadow-emerald-200', action: handleExportExcel },
              { label: 'PDF Report', icon: Download, color: 'bg-rose-600', shadow: 'shadow-rose-200', action: handleExportPDF },
              { label: 'Raw JSON', icon: Download, color: 'bg-[#253A7B]', shadow: 'shadow-blue-200', action: handleExportJSON }
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md ${btn.color} ${btn.shadow}`}
              >
                <btn.icon className="w-3.5 h-3.5" />
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
           <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">
            Showing {users.length} matching users out of {totalCount} total records
          </p>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">System Synchronized</span>
          </div>
        </div>
      </div>
    </div>
  );
}