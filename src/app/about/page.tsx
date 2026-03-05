import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="page-container max-w-3xl mx-auto">
      <h1 className="section-title text-center">אודות שקדול</h1>

      <div className="card flex flex-col gap-8">
        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-3">הסיפור שלנו</h2>
          <p className="text-gray-600 leading-relaxed">
            שקדול נולד מתוך רעיון פשוט וקסום: מה אם כולנו ביחד נמציא שפה חדשה?
            שפה שאין בה מילים מוכנות, אלא רק מילים שאנחנו - הקהילה - ממציאים!
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            כל מילה במילון השקדול הומצאה על ידי מישהו כמוכם. מישהו שישב, חשב,
            ויצר מילה חדשה שלא הייתה קיימת לפני כן.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-3">ועדת השפה</h2>
          <p className="text-gray-600 leading-relaxed">
            בראש ועדת השפה של שקדול עומדת <strong>גב&apos; שקד</strong>,
            שאחראית על אישור המילים שנכנסות למילון.
            הוועדה בודקת שכל מילה מתאימה לשפה הנקייה והיפה שאנחנו בונים יחד.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-3">החזון</h2>
          <p className="text-gray-600 leading-relaxed">
            אנחנו מאמינים שיצירתיות היא כוח. כשאנחנו ממציאים מילים חדשות,
            אנחנו בעצם ממציאים דרכים חדשות לחשוב, להרגיש ולתאר את העולם.
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            שקדול היא שפה טהורה ונקייה, שפה של כבוד ויצירתיות.
            שפה שכל אחד ואחת יכולים להיות חלק ממנה.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-3">איך זה עובד?</h2>
          <div className="grid gap-4">
            <div className="bg-amber-50 rounded-xl p-4">
              <h3 className="font-bold text-amber-800 mb-1">🎲 שלב 1: מקבלים אות</h3>
              <p className="text-gray-600">לוחצים על &quot;המציאו מילה&quot; והמחשב מגריל אות מהאלף-בית</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4">
              <h3 className="font-bold text-emerald-800 mb-1">✍️ שלב 2: ממציאים</h3>
              <p className="text-gray-600">יש 60 שניות להמציא מילה שמתחילה באות הזו ולהסביר מה היא אומרת</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-bold text-blue-800 mb-1">🔍 שלב 3: בדיקה</h3>
              <p className="text-gray-600">ועדת השפה בודקת את המילה ומחליטה אם לאשר אותה</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="font-bold text-purple-800 mb-1">⭐ שלב 4: במילון!</h3>
              <p className="text-gray-600">המילה נכנסת למילון ושמכם מופיע כממציאים!</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-3">שאלות נפוצות</h2>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-gray-700">כמה עולה להשתמש באתר?</h3>
              <p className="text-gray-600">כלום! השימוש חינמי לגמרי.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700">מי יכול להשתתף?</h3>
              <p className="text-gray-600">כל אחד ואחת! צריך רק להירשם עם אימייל.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700">כמה מילים אפשר להמציא ביום?</h3>
              <p className="text-gray-600">עד 10 מילים ביום.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700">כמה זמן לוקח לאשר מילה?</h3>
              <p className="text-gray-600">ועדת השפה בודקת מילים באופן שוטף. תקבלו הודעה ברגע שתהיה תשובה.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700">למה המילה שלי נדחתה?</h3>
              <p className="text-gray-600">ועדת השפה שולחת הסבר עם כל דחייה. בדקו בפרופיל שלכם.</p>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-xl font-bold text-amber-700 mb-3">יצירת קשר</h2>
          <p className="text-gray-600 mb-4">יש שאלות? רוצים לדבר איתנו?</p>
          <p className="text-gray-600">כתבו לנו: <strong>shakdol@example.com</strong></p>
        </section>

        <div className="text-center pt-4 border-t">
          <Link href="/create" className="btn-primary">
            בואו להמציא מילה!
          </Link>
        </div>
      </div>
    </div>
  );
}
