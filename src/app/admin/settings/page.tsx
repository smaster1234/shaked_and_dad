"use client";

import { useState, useEffect } from "react";

interface Setting {
  key: string;
  value: string;
  label: string;
  type: "number" | "select";
  options?: { value: string; label: string }[];
}

const GEMINI_MODELS = [
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite (הכי זול)" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro (הכי חזק)" },
];

const SETTING_DEFS: { key: string; label: string; type: "number" | "select"; default: string; options?: { value: string; label: string }[] }[] = [
  { key: "timerDuration", label: "זמן להגשה (שניות)", type: "number", default: "60" },
  { key: "maxWordLength", label: "אורך מילה מקסימלי", type: "number", default: "12" },
  { key: "maxMeaningSentences", label: "מקסימום משפטים בהסבר", type: "number", default: "2" },
  { key: "maxDailySubmissions", label: "מקסימום הגשות ליום", type: "number", default: "10" },
  { key: "suspendDuration24h", label: "השעיה קצרה (שעות)", type: "number", default: "24" },
  { key: "suspendDuration10d", label: "השעיה ארוכה (ימים)", type: "number", default: "240" },
  { key: "geminiModel", label: "מודל Gemini (Google AI)", type: "select", default: "gemini-2.0-flash-lite", options: GEMINI_MODELS },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      const settingsList = SETTING_DEFS.map((def) => ({
        key: def.key,
        value: data.settings?.[def.key] || def.default,
        label: def.label,
        type: def.type,
        options: def.options,
      }));
      setSettings(settingsList);
    } catch {
      setSettings(
        SETTING_DEFS.map((def) => ({
          key: def.key,
          value: def.default,
          label: def.label,
          type: def.type,
          options: def.options,
        }))
      );
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const settingsObj: Record<string, string> = {};
      settings.forEach((s) => (settingsObj[s.key] = s.value));

      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsObj }),
      });
      setMessage("ההגדרות נשמרו בהצלחה!");
    } catch {
      setMessage("שגיאה בשמירה");
    }
    setSaving(false);
  }

  if (loading) return <p className="text-gray-400">טוענים...</p>;

  return (
    <div>
      <h1 className="section-title">הגדרות מערכת</h1>

      <div className="card max-w-lg">
        <div className="flex flex-col gap-4">
          {settings.map((setting) => (
            <div key={setting.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {setting.label}
              </label>
              {setting.type === "select" ? (
                <select
                  value={setting.value}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev.map((s) =>
                        s.key === setting.key ? { ...s, value: e.target.value } : s
                      )
                    )
                  }
                  className="input-field"
                >
                  {setting.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={setting.value}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev.map((s) =>
                        s.key === setting.key ? { ...s, value: e.target.value } : s
                      )
                    )
                  }
                  className="input-field"
                />
              )}
            </div>
          ))}

          {message && (
            <p className={`text-sm ${message.includes("שגיאה") ? "text-red-500" : "text-emerald-600"}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? "שומרים..." : "שמירת הגדרות"}
          </button>
        </div>
      </div>
    </div>
  );
}
