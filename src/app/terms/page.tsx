export default function TermsPage() {
  return (
    <div className="page-container max-w-3xl mx-auto">
      <h1 className="section-title text-center">תקנון שקדול</h1>
      <p className="text-center text-gray-500 mb-8">הכללים שלנו - פשוט וברור</p>

      <div className="card flex flex-col gap-6">
        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-2">מה זה שקדול?</h2>
          <p className="text-gray-600 leading-relaxed">
            שקדול הוא אתר שבו כולנו ביחד ממציאים שפה חדשה! כל אחד יכול להמציא מילים חדשות,
            לתת להן משמעות, ולהכניס אותן למילון המיוחד שלנו.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-2">כללי ההתנהגות</h2>
          <ul className="list-disc list-inside text-gray-600 flex flex-col gap-2">
            <li>אנחנו מתייחסים לכולם בכבוד</li>
            <li>לא כותבים מילים או הסברים שפוגעים באנשים אחרים</li>
            <li>לא כותבים דברים גזעניים או מפלים</li>
            <li>לא כותבים קללות או מילים גסות</li>
            <li>לא כותבים דברים שלא מתאימים לילדים</li>
            <li>ממציאים מילים חדשות ויצירתיות!</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-2">מה קורה אם מפרים את הכללים?</h2>
          <div className="bg-amber-50 rounded-xl p-4 text-gray-600 flex flex-col gap-2">
            <p><strong>פעם ראשונה:</strong> מקבלים אזהרה</p>
            <p><strong>פעם שנייה:</strong> לא ניתן להיכנס למערכת במשך 24 שעות</p>
            <p><strong>פעם שלישית:</strong> לא ניתן להיכנס למערכת במשך 10 ימים</p>
            <p><strong>פעם רביעית:</strong> החשבון נחסם לצמיתות</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-2">איך ממציאים מילה?</h2>
          <ul className="list-disc list-inside text-gray-600 flex flex-col gap-2">
            <li>המחשב מגריל אות ויש לכם 60 שניות</li>
            <li>המילה יכולה להיות עד 12 אותיות</li>
            <li>ההסבר יכול להיות עד 2 משפטים</li>
            <li>המילה חייבת להישמע כמו מילה שאפשר לבטא</li>
            <li>אפשר להגיש עד 10 מילים ביום</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-2">ועדת השפה</h2>
          <p className="text-gray-600 leading-relaxed">
            כל מילה שנשלחת עוברת בדיקה של ועדת השפה בראשות גב&apos; שקד.
            הוועדה מחליטה אם המילה מתאימה להיכנס למילון.
            תקבלו הודעה כשהמילה שלכם מאושרת או נדחית.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-2">פרטיות</h2>
          <ul className="list-disc list-inside text-gray-600 flex flex-col gap-2">
            <li>אנחנו שומרים רק את השם, האימייל והגיל שלכם</li>
            <li>לא שומרים סיסמאות - הכניסה היא עם קישור באימייל</li>
            <li>המידע שלכם לא נמכר ולא מועבר לאף אחד</li>
            <li>השם שלכם מופיע ליד המילים שהמצאתם</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-2">זכויות יוצרים</h2>
          <p className="text-gray-600 leading-relaxed">
            המילים שאתם ממציאים שייכות לקהילת השקדול כולה.
            כשמילה נכנסת למילון, היא הופכת לחלק מהשפה של כולנו!
            השם שלכם תמיד יופיע כממציא/ת המילה.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-amber-700 mb-2">עלות</h2>
          <p className="text-gray-600 leading-relaxed text-lg font-medium">
            השימוש באתר חינמי לגמרי! אין תשלום, אין מנוי, אין עלויות נסתרות.
          </p>
        </section>
      </div>
    </div>
  );
}
