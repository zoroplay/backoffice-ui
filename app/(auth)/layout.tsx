import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import "../globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // optional: ensures all weights are available
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${outfit.className} relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0`}
      >
        <ThemeProvider>
          <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
            {children}
            <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
              <div className="relative items-center justify-center flex z-1">
                {/* ===== Common Grid Shape Start ===== */}
                <GridShape />
                <div className="flex flex-col items-center max-w-md text-center">
                  <h1 className="text-5xl font-semibold text-warning-400 dark:text-white/90 pb-2">
                    SportBook <span className="text-warning-25">Engine</span>
                  </h1>
                  <h2 className="text-4xl uppercase font-semibold text-white dark:text-white/90">
                    Software
                  </h2>
                </div>
              </div>
            </div>

            <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
              <ThemeTogglerTwo />
            </div>
          </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
