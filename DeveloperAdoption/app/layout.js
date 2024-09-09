import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SpreadX | Qubit",
  description: "Spreadx By Qubit",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="/socialcalc/socialcalc-3.js" defer></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
