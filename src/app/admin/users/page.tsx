"use client";

import { useState, useEffect } from "react";

interface AdminUser {
  id: string;
  serialNumber: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  age: number;
  role: string;
  status: string;
  warningCount: number;
  suspendedUntil: string | null;
  createdAt: string;
  _count: { submittedWords: number };
  wordStats: { total: number; approved: number; pending: number; rejected: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  }

  async function handleAction(userId: string, action: string) {
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      fetchUsers();
    } catch {
      alert("שגיאה");
    }
  }

  const filteredUsers = users.filter(
    (u) => u.firstName.includes(search) || u.lastName.includes(search) || u.fullName.includes(search) || u.email.includes(search)
  );

  const statusLabels: Record<string, { text: string; color: string }> = {
    ACTIVE: { text: "פעיל", color: "bg-emerald-100 text-emerald-700" },
    WARNED: { text: "אזהרה", color: "bg-amber-100 text-amber-700" },
    SUSPENDED: { text: "מושעה", color: "bg-orange-100 text-orange-700" },
    BANNED: { text: "חסום", color: "bg-red-100 text-red-700" },
  };

  const roleLabels: Record<string, string> = {
    USER: "משתמש",
    ADMIN: "מנהל",
    COMMITTEE: "ועדה",
  };

  // Summary stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "ACTIVE").length;
  const warnedUsers = users.filter(u => u.status === "WARNED").length;
  const suspendedUsers = users.filter(u => u.status === "SUSPENDED").length;
  const bannedUsers = users.filter(u => u.status === "BANNED").length;

  return (
    <div>
      <h1 className="section-title">ניהול משתמשים</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="card text-center py-3">
          <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
          <div className="text-xs text-gray-500">סה&quot;כ</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-2xl font-bold text-emerald-600">{activeUsers}</div>
          <div className="text-xs text-gray-500">פעילים</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-2xl font-bold text-amber-600">{warnedUsers}</div>
          <div className="text-xs text-gray-500">אזהרה</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-2xl font-bold text-orange-600">{suspendedUsers}</div>
          <div className="text-xs text-gray-500">מושעים</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-2xl font-bold text-red-600">{bannedUsers}</div>
          <div className="text-xs text-gray-500">חסומים</div>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-md"
          placeholder="חפשו לפי שם או אימייל..."
        />
      </div>

      {loading ? (
        <p className="text-gray-400">טוענים...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-sm">
            <thead>
              <tr className="border-b text-right text-sm text-gray-500">
                <th className="p-3">מס&apos;</th>
                <th className="p-3">שם פרטי</th>
                <th className="p-3">שם משפחה</th>
                <th className="p-3">אימייל</th>
                <th className="p-3">גיל</th>
                <th className="p-3">תפקיד</th>
                <th className="p-3">סטטוס</th>
                <th className="p-3">אזהרות</th>
                <th className="p-3">תרומות</th>
                <th className="p-3">אושרו</th>
                <th className="p-3">ממתינות</th>
                <th className="p-3">נדחו</th>
                <th className="p-3">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-400 font-mono">#{u.serialNumber}</td>
                  <td className="p-3 font-medium">{u.firstName}</td>
                  <td className="p-3">{u.lastName}</td>
                  <td className="p-3 text-sm text-gray-500" dir="ltr">{u.email}</td>
                  <td className="p-3">{u.age}</td>
                  <td className="p-3 text-sm">{roleLabels[u.role]}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusLabels[u.status]?.color}`}>
                      {statusLabels[u.status]?.text}
                    </span>
                  </td>
                  <td className="p-3">{u.warningCount}</td>
                  <td className="p-3 font-medium">{u.wordStats.total}</td>
                  <td className="p-3 text-emerald-600">{u.wordStats.approved}</td>
                  <td className="p-3 text-amber-600">{u.wordStats.pending}</td>
                  <td className="p-3 text-red-500">{u.wordStats.rejected}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {u.status !== "BANNED" && (
                        <button
                          onClick={() => handleAction(u.id, "ban")}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          חסום
                        </button>
                      )}
                      {(u.status === "SUSPENDED" || u.status === "BANNED") && (
                        <button
                          onClick={() => handleAction(u.id, "activate")}
                          className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
                        >
                          הפעל
                        </button>
                      )}
                      {u.status === "ACTIVE" && u.role === "USER" && (
                        <button
                          onClick={() => handleAction(u.id, "make_committee")}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        >
                          ועדה
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
