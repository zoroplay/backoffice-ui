"use client";

import React from "react";

type LoadingStateProps = {
  text?: string;
  className?: string;
};

export function LoadingState({
  text = "Loading...",
  className,
}: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className ?? ""}`}>
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      <span className="text-gray-500">{text}</span>
    </div>
  );
}
