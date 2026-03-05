import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-container max-w-md mx-auto mt-16 text-center">
      <div className="card">
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-3xl font-bold mb-4">הדף לא נמצא</h1>
        <p className="text-gray-600 mb-6">
          אולי המילה הזו עוד לא הומצאה? נראה שהדף שחיפשתם לא קיים.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            חזרה לעמוד הראשי
          </Link>
          <Link href="/dictionary" className="btn-secondary">
            למילון השקדול
          </Link>
        </div>
      </div>
    </div>
  );
}
