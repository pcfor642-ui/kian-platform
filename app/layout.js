import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "کیان — پلتفرم آموزشی",
  description: "پلتفرم مدیریت آموزشی کیان برای مدیر، معلم و دانش‌آموز",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/vazirmatn/33.003/Vazirmatn-font-face.css" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
