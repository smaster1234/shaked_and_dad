import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "COMMITTEE")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-purple-800 text-white py-3">
        <div className="page-container">
          <div className="flex items-center gap-6 overflow-x-auto">
            <span className="font-bold text-lg flex-shrink-0">ניהול שקדול</span>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="hover:text-purple-200 transition-colors flex-shrink-0">
                דשבורד
              </Link>
              <Link href="/admin/words" className="hover:text-purple-200 transition-colors flex-shrink-0">
                מילים
              </Link>
              <Link href="/admin/users" className="hover:text-purple-200 transition-colors flex-shrink-0">
                משתמשים
              </Link>
              <Link href="/admin/logs" className="hover:text-purple-200 transition-colors flex-shrink-0">
                לוגים
              </Link>
              <Link href="/admin/settings" className="hover:text-purple-200 transition-colors flex-shrink-0">
                הגדרות
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="page-container">{children}</div>
    </div>
  );
}
