"use client";

import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/app/layout/AppHeader";
import AppSidebar from "@/app/layout/AppSidebar";
import Backdrop from "@/app/layout/Backdrop";
import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { Outfit } from "next/font/google";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css";
import "../globals.css";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <MainContent>{children}</MainContent>
    </div>
  );
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div
      className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
    >
      {/* Header */}
      <AppHeader />
      {/* Page Content */}
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        {children}
      </div>
    </div>
  );
}
