# کیان — پلتفرم آموزشی

نسخه‌ی واقعی و قابل‌انتشار پلتفرم آموزشی «کیان»، ساخته‌شده با Next.js (App Router)، Prisma و Postgres (Supabase)، با احراز هویت واقعی (NextAuth v5 + bcrypt).

## پشته‌ی فنی

- **Next.js 16** (App Router, JavaScript)
- **Prisma 6** + **PostgreSQL** (Supabase)
- **NextAuth (Auth.js) v5** — احراز هویت با نام‌کاربری/رمز عبور (Credentials Provider)
- **bcryptjs** — هش کردن رمز عبور (هیچ رمزی به‌صورت متن ساده ذخیره نمی‌شود)
- **lucide-react** — آیکون‌ها

## راه‌اندازی محلی

```bash
npm install
```

مقادیر `.env` را بر اساس `.env.example` تنظیم کنید:

- `DATABASE_URL` / `DIRECT_URL` — اتصال به Postgres (Supabase Connection Pooler)
- `AUTH_SECRET` — با `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` بسازید
- `ANTHROPIC_API_KEY` — اختیاری؛ برای فعال‌سازی ویژگی «تبدیل متن به سؤال» با هوش مصنوعی

سپس مایگریشن‌ها را اجرا و دیتابیس را seed کنید:

```bash
npx prisma migrate deploy
npm run db:seed
```

اجرای سرور توسعه:

```bash
npm run dev
```

## حساب مدیر پیش‌فرض

طبق سند اولیه، در seed ساخته می‌شود:

- نام کاربری: `kiyan school`
- رمز عبور: `omid1396`

**توصیه امنیتی:** بلافاصله پس از اولین ورود، این رمز را از بخش «مدیریت کاربران» یا مستقیماً در دیتابیس تغییر دهید.

همچنین یک معلم و دو دانش‌آموز نمونه seed می‌شوند (`kamal.rezaei` / `kamal123`، `ali.m` / `ali123`، `negar.a` / `negar123`) — در صورت نیاز می‌توانید این کاربران نمونه را از پنل مدیریت حذف کنید.

## مدل داده (Prisma)

- `User` — نقش‌های ADMIN / TEACHER / STUDENT، `passwordHash` هش‌شده، رابطه‌ی معلم↔دانش‌آموز
- `Question` — بانک سؤال (مشترک بین مدیر و همه‌ی معلم‌ها)
- `Assignment` — تمرین/آزمون یکپارچه (`type: EXERCISE | EXAM`)
- `Result` — نتیجه‌ی هر دانش‌آموز برای هر تمرین/آزمون
- `ExitEvent` — رویدادهای خروج مشکوک از صفحه‌ی آزمون
- `Message` — پیام‌های مستقیم بین کاربران
- `SchoolSettings` — تنظیمات کلی مدرسه

## نکته درباره‌ی طراحی داده

طبق نمونه‌ی اولیه، بانک سؤال و تمرین‌ها/آزمون‌ها بین مدیر و همه‌ی معلم‌ها **مشترک** هستند (نه مختص هر معلم) — این رفتار عمداً از نسخه‌ی فرانت‌اند اولیه حفظ شده است. نتایج، پیام‌ها و رویدادهای خروج، در بک‌اند بر اساس نقش کاربر (مدیر همه، معلم فقط دانش‌آموزان خودش، دانش‌آموز فقط داده‌ی خودش) فیلتر و محافظت می‌شوند.

## استقرار (Deploy)

این پروژه برای استقرار روی **Vercel** آماده است:

1. پروژه را در یک ریپازیتوری Git قرار دهید (`git init` در صورت نیاز).
2. در Vercel، پروژه را از ریپازیتوری import کنید.
3. متغیرهای محیطی (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, و در صورت نیاز `ANTHROPIC_API_KEY`) را در تنظیمات پروژه‌ی Vercel وارد کنید.
4. پس از اولین دیپلوی، یک‌بار از طریق `npx prisma migrate deploy` (یا با اتصال محلی به همان دیتابیس) مطمئن شوید مایگریشن‌ها اعمال و seed اجرا شده‌اند.

## ساختار پوشه‌ها

```
app/                  مسیرهای Next.js App Router + API Routes
  api/                 تمام endpointهای REST (users, questions, assignments, results, ...)
components/            کامپوننت‌های React (UI دقیقاً مطابق نمونه‌ی اولیه)
lib/                   Prisma client, تنظیمات NextAuth, serialize helpers
prisma/                schema.prisma, migrations, seed.js
```
