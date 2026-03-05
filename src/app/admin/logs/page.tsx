"use client";

import { useState, useEffect } from "react";

interface LogEntry {
  id: string;
  wordAttempt: string;
  meaningAttempt: string;
  reason: string;
  actionTaken: string;
  createdAt: string;
  user: { fullName: string; serialNumber: number; email: string };
}

interface AuditEntry {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  createdAt: string;
  admin: { fullName: string; serialNumber: number };
}

export default function AdminLogsPage() {
  const [tab, setTab] = useState<"moderation" | "audit">("moderation");
  const [moderationLogs, setModerationLogs] = useState<LogEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/logs?type=${tab}`);
      const data = await res.json();
      if (tab === "moderation") {
        setModerationLogs(data.logs || []);
      } else {
        setAuditLogs(data.logs || []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  const actionLabels: Record<string, string> = {
    WARNING: "אזהרה",
    SUSPEND_24H: "השעיה 24ש",
    SUSPEND_10D: "השעיה 10 ימים",
    BAN: "חסימה",
    APPROVE_WORD: "אישור מילה",
    REJECT_WORD: "דחיית מילה",
    DELETE_WORD: "מחיקת מילה",
    SUSPEND_USER: "השעיית משתמש",
    UNSUSPEND_USER: "ביטול השעיה",
    BAN_USER: "חסימת משתמש",
    UNBAN_USER: "ביטול חסימה",
    WARN_USER: "אזהרת משתמש",
    CHANGE_SETTING: "שינוי הגדרה",
    CHANGE_USER_ROLE: "שינוי תפקיד",
  };

  return (
    <div>
      <h1 className="section-title">לוגים</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("moderation")}
          className={`px-4 py-2 rounded-lg font-medium ${
            tab === "moderation" ? "bg-purple-700 text-white" : "bg-white text-gray-600"
          }`}
        >
          ניטור תוכן
        </button>
        <button
          onClick={() => setTab("audit")}
          className={`px-4 py-2 rounded-lg font-medium ${
            tab === "audit" ? "bg-purple-700 text-white" : "bg-white text-gray-600"
          }`}
        >
          פעולות אדמין
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">טוענים...</p>
      ) : tab === "moderation" ? (
        <div className="flex flex-col gap-3">
          {moderationLogs.length === 0 ? (
            <p className="text-gray-400">אין לוגים</p>
          ) : (
            moderationLogs.map((log) => (
              <div key={log.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold">{log.user.fullName} (#{log.user.serialNumber})</span>
                    <span className="text-gray-400 text-sm mr-2">({log.user.email})</span>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    {actionLabels[log.actionTaken] || log.actionTaken}
                  </span>
                </div>
                <p className="text-sm mt-2">
                  <strong>מילה:</strong> {log.wordAttempt} | <strong>משמעות:</strong> {log.meaningAttempt}
                </p>
                <p className="text-sm text-red-500 mt-1">סיבה: {log.reason}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(log.createdAt).toLocaleString("he-IL")}
                </p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {auditLogs.length === 0 ? (
            <p className="text-gray-400">אין לוגים</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="card">
                <div className="flex justify-between items-start">
                  <span className="font-bold">{log.admin.fullName} (#{log.admin.serialNumber})</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {actionLabels[log.action] || log.action}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {log.targetType}: {log.targetId}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(log.createdAt).toLocaleString("he-IL")}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
