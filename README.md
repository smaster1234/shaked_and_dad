# שקדול - המילון שאנחנו בונים יחד!

פלטפורמה קהילתית לפיתוח שפה חדשה בשם **שקדול**. משתמשים ממציאים מילים חדשות, נותנים להן משמעות, והן נכנסות למילון לאחר אישור ועדת השפה.

## התקנה מקומית

```bash
# התקנת dependencies
npm install

# העתקת משתני סביבה
cp .env.example .env
# ערכו את .env עם הפרטים שלכם

# יצירת בסיס נתונים
npx prisma migrate dev --name init

# הזנת נתונים ראשוניים (אדמין + הגדרות)
npm run db:seed

# הרצה
npm run dev
```

## משתני סביבה נדרשים

| משתנה | תיאור |
|-------|-------|
| `DATABASE_URL` | חיבור PostgreSQL |
| `NEXTAUTH_URL` | כתובת האתר |
| `NEXTAUTH_SECRET` | מפתח סודי ל-NextAuth |
| `EMAIL_SERVER_HOST` | שרת SMTP |
| `EMAIL_SERVER_PORT` | פורט SMTP |
| `EMAIL_SERVER_USER` | משתמש SMTP |
| `EMAIL_SERVER_PASSWORD` | סיסמת SMTP |
| `EMAIL_FROM` | כתובת שולח |
| `GEMINI_API_KEY` | מפתח API של Gemini |

## Deploy ל-Railway

1. צרו פרויקט חדש ב-Railway
2. הוסיפו שירות PostgreSQL
3. חברו את ה-GitHub repo
4. הגדירו את כל משתני הסביבה
5. Railway ישתמש ב-`railway.json` אוטומטית:
   - Build: `npx prisma generate && npm run build`
   - Start: `npx prisma migrate deploy && npm start`
6. הריצו seed: `npm run db:seed` (דרך Railway CLI)

## מבנה הפרויקט

```
src/
├── app/               # דפים ו-API routes
│   ├── admin/         # פאנל ניהול
│   ├── auth/          # הרשמה וכניסה
│   ├── create/        # המצאת מילה
│   ├── dictionary/    # המילון
│   ├── profile/       # פרופיל אישי
│   ├── terms/         # תקנון
│   ├── about/         # אודות
│   └── api/           # API endpoints
├── components/        # קומפוננטות React
├── lib/               # לוגיקה עסקית
└── types/             # TypeScript types
```

## טכנולוגיות

- **Next.js 14** - App Router, SSR
- **Tailwind CSS** - עיצוב RTL
- **Prisma** - ORM + PostgreSQL
- **NextAuth.js** - אימות עם magic link
- **Gemini 2.0 Flash** - ניטור תוכן ובדיקת ביטוי
- **Railway** - hosting
