import { prisma } from "@/lib/prisma";

async function getAdminStats() {
  try {
    const [totalUsers, totalWords, pendingWords, approvedWords, rejectedWords, totalViolations, bannedUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.word.count(),
        prisma.word.count({ where: { status: "PENDING" } }),
        prisma.word.count({ where: { status: "APPROVED" } }),
        prisma.word.count({ where: { status: "REJECTED" } }),
        prisma.moderationLog.count(),
        prisma.user.count({ where: { status: "BANNED" } }),
      ]);

    return { totalUsers, totalWords, pendingWords, approvedWords, rejectedWords, totalViolations, bannedUsers };
  } catch {
    return { totalUsers: 0, totalWords: 0, pendingWords: 0, approvedWords: 0, rejectedWords: 0, totalViolations: 0, bannedUsers: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const statCards = [
    { label: "משתמשים", value: stats.totalUsers, color: "text-blue-600" },
    { label: "סה\"כ מילים", value: stats.totalWords, color: "text-gray-700" },
    { label: "ממתינות לאישור", value: stats.pendingWords, color: "text-amber-600" },
    { label: "מאושרות", value: stats.approvedWords, color: "text-emerald-600" },
    { label: "נדחו", value: stats.rejectedWords, color: "text-red-500" },
    { label: "הפרות תוכן", value: stats.totalViolations, color: "text-orange-600" },
    { label: "משתמשים חסומים", value: stats.bannedUsers, color: "text-red-700" },
  ];

  return (
    <div>
      <h1 className="section-title">דשבורד ניהול</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="card text-center">
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
