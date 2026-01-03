"use client";

import React, { useEffect, useState } from "react";
import { exportToExcel, exportToJSON, exportToPDF } from "@/utils/exportUtils";
import apiAdmin from "@/lib/apiAdmin";
import { Search, Filter, Download, Eye, Edit, Trash2, Ban, CheckCircle, XCircle } from "lucide-react";

interface AllUser { _id: string; fullName: string; email: string; mobile?: string; status: "Active" | "Inactive" | "Blocked"; registrationDate: string; lastLogin: string; }

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

        {/* VIEW DETAILS */}
        {type === "view" && (
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Name:</strong> {user.fullName}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Mobile:</strong> {user.mobile || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {user.status}
            </p>
            <p>
              <strong>Registered:</strong> {user.registrationDate}
            </p>
            <p>
              <strong>Last Login:</strong> {user.lastLogin}
            </p>
          </div>
        )}

        {/* EDIT USER */}
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

        {/* BLOCK USER */}
        {type === "block" && (
          <p className="text-gray-700">
            Are you sure you want to block{" "}
            <strong>{user.fullName}</strong>?
          </p>
        )}

        {/* UNBLOCK USER */}
        {type === "unblock" && (
          <p className="text-gray-700">
            Are you sure you want to unblock{" "}
            <strong>{user.fullName}</strong>?
          </p>
        )}

        {/* DELETE USER */}
        {type === "delete" && (
          <p className="text-gray-700">
            Are you sure you want to permanently delete{" "}
            <strong>{user.fullName}</strong>?
          </p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          {(type === "block" ||
            type === "unblock" ||
            type === "delete" ||
            type === "edit") && (
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black"
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
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive" | "Blocked"
  >("All");
  const [actionPopup, setActionPopup] = useState<{
    userId: string;
    position: { x: number; y: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<{
    type: ModalType;
    user: AllUser | null;
  }>({ type: null, user: null });

  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
    mobile: "",
  });
  // ✅ Fetch all users from backend using cookie
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiAdmin.get("api/admin/panel/all-users");
        setUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // ✅ Run only once on mount

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ Search + Filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.mobile && user.mobile.includes(searchQuery));

    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ✅ Export Functions
  const handleExportPDF = () => {
    exportToPDF(filteredUsers, "users");
  };


  const handleExportExcel = () => {
    exportToExcel(filteredUsers, "users");
  };

  const handleExportJSON = () => {
    exportToJSON(filteredUsers, "users");
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
        await apiAdmin.put(`api/admin/panel/user/${userId}`, editData);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, ...editData } : u))
        );
      }

      // ✅ BLOCK USER
      if (activeModal.type === "block") {
        await apiAdmin.post(`api/admin/panel/user/${userId}/block`);
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, status: "Blocked" } : u
          )
        );
      }

      // ✅ UNBLOCK USER
      if (activeModal.type === "unblock") {
        await apiAdmin.post(`api/admin/panel/user/${userId}/unblock`);
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, status: "Active" } : u
          )
        );
      }

      // ✅ DELETE USER
      if (activeModal.type === "delete") {
        await apiAdmin.delete(`api/admin/panel/user/${userId}`);
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }

      setActiveModal({ type: null, user: null });
    } catch (err) {
      console.error("❌ Action failed:", err);
      alert("Action failed");
    }
  };


  // ✅ Helper to get badge classes based on status
  const getStatusClasses = (status: AllUser["status"]) => {
    if (status === "Active") return "bg-green-600 text-white";
    if (status === "Blocked") return "bg-red-600 text-white";
    return "bg-gray-300 text-gray-700"; // Inactive or anything else
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
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-gray-900 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "All" | "Active" | "Inactive" | "Blocked"
                )
              }
              className="px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300 w-full sm:w-auto"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    User Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Registration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
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
                      <button
                        onClick={(e) => handleActionClick(user._id, e)}
                        className="px-3 py-1 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        Actions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
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
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white p-4 rounded-2xl shadow border border-gray-200"
            >
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-gray-900 font-semibold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user.fullName}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">
                      {user.mobile || "N/A"}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClasses(
                    user.status
                  )}`}
                >
                  {user.status}
                </span>
              </div>

              <div className="flex justify-between mt-3 text-xs text-gray-500">
                <span>Reg: {formatDate(user.registrationDate)}</span>
                <span>Last: {formatDateTime(user.lastLogin)}</span>
              </div>

              <button
                onClick={(e) => handleActionClick(user._id, e)}
                className="mt-3 w-full px-3 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-xl shadow-md transition-all"
              >
                Actions
              </button>
            </div>
          ))
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

      {/* Export */}
      <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-lg">
        <h3 className="text-sm font-semibold text-[#253A7B] mb-4">
          Export Users Data
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:shadow-lg transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Export to PDF
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-[#253A7B] text-white rounded-xl hover:bg-[#1e2f63] hover:shadow-lg transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Export to JSON
          </button>

        </div>

        <p className="text-xs text-gray-500 mt-3">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>
    </div>
  );
}
