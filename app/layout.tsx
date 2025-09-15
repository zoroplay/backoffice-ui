// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

// Optional: if you're using custom fonts via next/font
// import { Inter } from "next/font/google";
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SBE BackOffice",
  description: "Backoffice UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        // className={inter.className} // if you add a font
        className="antialiased bg-gray-50 text-gray-900"
      >
        {children}
      </body>
    </html>
  );
}
