"use client";

import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/app/layout/AppHeader";
import AppSidebar from "@/app/layout/AppSidebar";
import Backdrop from "@/app/layout/Backdrop";
import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { SearchProvider } from "@/context/SearchContext";
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
    <div className="">
      <ThemeProvider>
        <SearchProvider>
          <SidebarProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
          </SidebarProvider>
        </SearchProvider>
      </ThemeProvider>
    </div>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className=" min-h-screen xl:flex">
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
      className={`fixed inset-0 ${mainContentMargin} flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Fixed Header */}
      <AppHeader />
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 custom-scrollbar">
        <div className="min-h-full p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
