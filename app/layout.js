import { Geologica } from "next/font/google";
import "./globals.css";

const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["latin", "cyrillic"],
});

export const metadata = {
  title: "Фотоконкурс",
  description: "Большая уральская тропа - фотоконкурс",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={`${geologica.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
