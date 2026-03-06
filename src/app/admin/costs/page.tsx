"use client";

import { useState, useEffect } from "react";

interface CostData {
  allTime: { totalCalls: number; totalTokens: number; inputTokens: number; outputTokens: number; estimatedCost: number };
  last30Days: { totalCalls: number; totalTokens: number; estimatedCost: number };
  today: { totalCalls: number; totalTokens: number; estimatedCost: number };
  byOperation: { operation: string; _sum: { totalTokens: number; estimatedCost: number }; _count: number }[];
  byModel: { model: string; _sum: { totalTokens: number; estimatedCost: number }; _count: number }[];
  recentLogs: { id: string; model: string; operation: string; inputTokens: number; outputTokens: number; estimatedCost: number; createdAt: string }[];
  email: {
    allTime: { totalEmails: number; estimatedCost: number };
    last30Days: { totalEmails: number; estimatedCost: number };
    today: { totalEmails: number; estimatedCost: number };
    byType: { type: string; _sum: { estimatedCost: number }; _count: number }[];
  };
}

const operationLabels: Record<string, string> = {
  content_safety: "סינון תוכן",
  pronounceability: "בדיקת הגייה",
  similarity_check: "בדיקת דמיון מילים",
  sentence_validation: "בדיקת משפטים",
  definition_suggestion: "הצעת הגדרה חלופית",
};

const emailTypeLabels: Record<string, string> = {
  magic_link: "קישור התחברות",
  notification: "התראה",
};

export default function AdminCostsPage() {
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/llm-costs")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">טוענים...</p>;
  if (!data) return <p className="text-red-500">שגיאה בטעינת הנתונים</p>;

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;
  const formatTokens = (tokens: number) => tokens.toLocaleString();

  return (
    <div>
      <h1 className="section-title">עלויות שירותים</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <h3 className="text-sm text-gray-500 mb-1">היום</h3>
          <div className="text-2xl font-bold text-blue-600">{formatCost(data.today.estimatedCost)}</div>
          <div className="text-xs text-gray-400 mt-1">{data.today.totalCalls} קריאות | {formatTokens(data.today.totalTokens)} טוקנים</div>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-500 mb-1">30 ימים אחרונים</h3>
          <div className="text-2xl font-bold text-amber-600">{formatCost(data.last30Days.estimatedCost)}</div>
          <div className="text-xs text-gray-400 mt-1">{data.last30Days.totalCalls} קריאות | {formatTokens(data.last30Days.totalTokens)} טוקנים</div>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-500 mb-1">סה&quot;כ</h3>
          <div className="text-2xl font-bold text-emerald-600">{formatCost(data.allTime.estimatedCost)}</div>
          <div className="text-xs text-gray-400 mt-1">
            {data.allTime.totalCalls} קריאות | {formatTokens(data.allTime.totalTokens)} טוקנים
            <br />
            קלט: {formatTokens(data.allTime.inputTokens)} | פלט: {formatTokens(data.allTime.outputTokens)}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* By Operation */}
        <div className="card">
          <h3 className="font-bold mb-3">לפי סוג פעולה</h3>
          {data.byOperation.length === 0 ? (
            <p className="text-gray-400 text-sm">אין נתונים עדיין</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.byOperation.map((op) => (
                <div key={op.operation} className="flex justify-between items-center text-sm">
                  <span>{operationLabels[op.operation] || op.operation}</span>
                  <span className="text-gray-500">
                    {op._count} קריאות | {formatCost(op._sum.estimatedCost || 0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By Model */}
        <div className="card">
          <h3 className="font-bold mb-3">לפי מודל</h3>
          {data.byModel.length === 0 ? (
            <p className="text-gray-400 text-sm">אין נתונים עדיין</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.byModel.map((m) => (
                <div key={m.model} className="flex justify-between items-center text-sm">
                  <span dir="ltr" className="font-mono">{m.model}</span>
                  <span className="text-gray-500">
                    {m._count} קריאות | {formatCost(m._sum.estimatedCost || 0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent logs */}
      <div className="card">
        <h3 className="font-bold mb-3">קריאות LLM אחרונות</h3>
        {data.recentLogs.length === 0 ? (
          <p className="text-gray-400 text-sm">אין קריאות עדיין</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-right text-gray-500">
                  <th className="p-2">תאריך</th>
                  <th className="p-2">פעולה</th>
                  <th className="p-2">מודל</th>
                  <th className="p-2">קלט</th>
                  <th className="p-2">פלט</th>
                  <th className="p-2">עלות</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-xs">{new Date(log.createdAt).toLocaleString("he-IL")}</td>
                    <td className="p-2">{operationLabels[log.operation] || log.operation}</td>
                    <td className="p-2 font-mono text-xs" dir="ltr">{log.model}</td>
                    <td className="p-2">{log.inputTokens}</td>
                    <td className="p-2">{log.outputTokens}</td>
                    <td className="p-2">{formatCost(log.estimatedCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resend Email Costs */}
      {data.email && (
        <>
          <h2 className="section-title mt-8">עלויות Resend (אימיילים)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card">
              <h3 className="text-sm text-gray-500 mb-1">היום</h3>
              <div className="text-2xl font-bold text-blue-600">{formatCost(data.email.today.estimatedCost)}</div>
              <div className="text-xs text-gray-400 mt-1">{data.email.today.totalEmails} אימיילים</div>
            </div>
            <div className="card">
              <h3 className="text-sm text-gray-500 mb-1">30 ימים אחרונים</h3>
              <div className="text-2xl font-bold text-amber-600">{formatCost(data.email.last30Days.estimatedCost)}</div>
              <div className="text-xs text-gray-400 mt-1">{data.email.last30Days.totalEmails} אימיילים</div>
            </div>
            <div className="card">
              <h3 className="text-sm text-gray-500 mb-1">סה&quot;כ</h3>
              <div className="text-2xl font-bold text-emerald-600">{formatCost(data.email.allTime.estimatedCost)}</div>
              <div className="text-xs text-gray-400 mt-1">{data.email.allTime.totalEmails} אימיילים</div>
            </div>
          </div>

          {data.email.byType.length > 0 && (
            <div className="card mb-8">
              <h3 className="font-bold mb-3">לפי סוג אימייל</h3>
              <div className="flex flex-col gap-2">
                {data.email.byType.map((t) => (
                  <div key={t.type} className="flex justify-between items-center text-sm">
                    <span>{emailTypeLabels[t.type] || t.type}</span>
                    <span className="text-gray-500">
                      {t._count} אימיילים | {formatCost(t._sum.estimatedCost || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
