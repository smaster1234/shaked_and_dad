const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin1234", 12);

  const admin = await prisma.user.upsert({
    where: { email: "ran.mov@gmail.com" },
    update: { passwordHash: adminPasswordHash, role: "ADMIN", firstName: "רן", lastName: "אבא בובי", fullName: "רן אבא בובי" },
    create: {
      email: "ran.mov@gmail.com",
      firstName: "רן",
      lastName: "אבא בובי",
      fullName: "רן אבא בובי",
      age: 30,
      role: "ADMIN",
      status: "ACTIVE",
      passwordHash: adminPasswordHash,
      termsAcceptedAt: new Date(),
    },
  });

  console.log("Admin user created:", admin.email);

  const defaultSettings = [
    { key: "timerDuration", value: "60" },
    { key: "maxWordLength", value: "12" },
    { key: "maxMeaningSentences", value: "2" },
    { key: "maxDailySubmissions", value: "10" },
    { key: "suspendDuration24h", value: "24" },
    { key: "suspendDuration10d", value: "240" },
    { key: "geminiModel", value: "gemini-2.0-flash-lite" },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("Default settings created");

  const seedUser = await prisma.user.upsert({
    where: { email: "shaked@shakdol.com" },
    update: {},
    create: {
      email: "shaked@shakdol.com",
      firstName: "שקד",
      lastName: "מוביץ",
      fullName: "שקד מוביץ",
      age: 10,
      role: "USER",
      status: "ACTIVE",
      termsAcceptedAt: new Date(),
    },
  });

  const sampleWords = [
    { word: "שקובביר", meaning: "שכונה ברוסיה שכל הנשים בה נקראות סביטלנה ועובדות בתור מנקות בתים", startingLetter: "ש" },
    { word: "טקרורריה", meaning: "שכונה בטורקיה שכל מי שגר בה מקבל שני אוטובוסים, פורשה ומכסה אסלה עם ניילון שאפשר לקלף", startingLetter: "ט" },
    { word: "הורצלקיכוס", meaning: "חיידק שגורם לאנשים לצחוק בלי סיבה", startingLetter: "ה" },
    { word: "הצרקליכ", meaning: "רמטכל צבא אלבניה", startingLetter: "ה" },
    { word: "זובולר", meaning: "העכבר המעופף של ביבי ראש הממשלה שאף פעם לא היה מאולף", startingLetter: "ז" },
    { word: "יפרמין", meaning: "תרופה שמבטלת את כל התרופות", startingLetter: "י" },
    { word: "ניקפורה", meaning: "משקה שגורם לאנשים להיות כמו יובל המבולבל משולב עם מני מני ממטרה שמתלבשים כמו מיקי כוכבת הילדים", startingLetter: "נ" },
    { word: "עורקלים", meaning: "גזע של גמדים שחי בעבר בבית שאן", startingLetter: "ע" },
    { word: "יאקרחיח", meaning: "חיידק שהופך אנשים לקרחים", startingLetter: "י" },
    { word: "וורפוחה", meaning: "חמאה יוונית אדומה", startingLetter: "ו" },
    { word: "תפלילון", meaning: "מישהו שהעבודה שלו להחזיק את ספרי התפילה למתפללים", startingLetter: "ת" },
    { word: "גרוחש", meaning: "כלב פודל ורוד", startingLetter: "ג" },
    { word: "שופצימור", meaning: "שם של יצרן מכוניות שלא ייצר אף מכונית", startingLetter: "ש" },
    { word: "וופרש", meaning: "בושם בריח של בית שחי של סנאי", startingLetter: "ו" },
    { word: "יורקיל", meaning: "סבתא נרגנת ועצבנית משבט עורקלים", startingLetter: "י" },
    { word: "זושרק", meaning: "חמור ערבי שבמשחק של ביתר ירושלים נגד בני סכנין צועק הלאה ביתר", startingLetter: "ז" },
    { word: "שפרוץ", meaning: "סוג של קוקה קולה שהכי משמינה בעולם. ההיפך מזירו", startingLetter: "ש" },
    { word: "חורשלס", meaning: "שבט שמשעמם לו בחיים ושר שירים של עומר אדם ברחוב", startingLetter: "ח" },
  ];

  for (const w of sampleWords) {
    await prisma.word.upsert({
      where: { word: w.word },
      update: {},
      create: {
        word: w.word,
        meaning: w.meaning,
        startingLetter: w.startingLetter,
        status: "APPROVED",
        submittedById: seedUser.id,
        reviewedById: admin.id,
        submissionTime: Math.floor(Math.random() * 40) + 10,
      },
    });
  }

  console.log(`Seeded ${sampleWords.length} sample words`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
