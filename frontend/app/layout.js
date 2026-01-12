import { Geologica } from "next/font/google";
import "./globals.css";

const geologica = Geologica({
  variable: "--font-geologica",
  subsets: ["latin", "cyrillic"],
});

export const metadata = {
  title: {
    default: "Фотоконкурс",
    template: "%s | Фотоконкурс",
  },
  description: "Платформа для проведения фотоконкурсов",
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
