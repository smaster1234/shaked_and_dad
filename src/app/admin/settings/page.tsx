"use client";

import { useState, useEffect } from "react";

interface Setting {
  key: string;
  value: string;
  label: string;
}

const SETTING_LABELS: Record<string, string> = {
  timerDuration: "זמן להגשה (שניות)",
  maxWordLength: "אורך מילה מקסימלי",
  maxMeaningSentences: "מקסימום משפטים בהסבר",
  maxDailySubmissions: "מקסימום הגשות ליום",
  suspendDuration24h: "השעיה קצרה (שעות)",
  suspendDuration10d: "השעיה ארוכה (ימים)",
};

const DEFAULT_SETTINGS: Record<string, string> = {
  timerDuration: "60",
  maxWordLength: "12",
  maxMeaningSentences: "2",
  maxDailySubmissions: "10",
  suspendDuration24h: "24",
  suspendDuration10d: "240",
};

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
      const settingsList = Object.keys(SETTING_LABELS).map((key) => ({
        key,
        value: data.settings?.[key] || DEFAULT_SETTINGS[key] || "",
        label: SETTING_LABELS[key],
      }));
      setSettings(settingsList);
    } catch {
      // Use defaults
      setSettings(
        Object.keys(SETTING_LABELS).map((key) => ({
          key,
          value: DEFAULT_SETTINGS[key] || "",
          label: SETTING_LABELS[key],
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
