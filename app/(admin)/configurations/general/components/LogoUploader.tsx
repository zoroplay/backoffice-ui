'use client';

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageUp, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";

import type { GeneralSettings } from "../types";

type LogoUploaderProps = {
  label: string;
  description: string;
  value: GeneralSettings["mainLogo"];
  onChange: (value: string | null) => void;
  accept?: string;
  showInitialPreview?: boolean;
};

export function LogoUploader({
  label,
  description,
  value,
  onChange,
  accept = "image/*",
  showInitialPreview = true,
}: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hasUserUploaded, setHasUserUploaded] = useState(false);

  const shouldShowPreview =
    Boolean(value) && (showInitialPreview || hasUserUploaded);

  useEffect(() => {
    if (!value) {
      setHasUserUploaded(false);
    }
  }, [value]);

  const handlePickFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      onChange(result);
      setHasUserUploaded(true);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setHasUserUploaded(false);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div
        className={cn(
          "relative flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 p-6 text-center transition hover:border-brand-200 hover:bg-white dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-brand-500/40 dark:hover:bg-gray-900",
          shouldShowPreview &&
            "border-solid border-brand-200 bg-white dark:border-brand-500/40"
        )}
      >
        {shouldShowPreview && value ? (
          <div className="relative h-28 w-28">
            <Image
              src={value}
              alt={`${label} preview`}
              fill
              className="object-contain"
              sizes="112px"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 dark:bg-brand-500/20 dark:text-brand-200">
            <ImageUp className="h-7 w-7" />
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            startIcon={<ImageUp className="h-4 w-4" />}
            onClick={handlePickFile}
            type="button"
          >
            {shouldShowPreview ? "Change" : "Upload"}
          </Button>
          {shouldShowPreview && value && (
            <Button
              variant="outline"
              size="sm"
              className="border-transparent text-red-500 hover:border-red-200 hover:bg-red-500/10 hover:text-red-600 dark:hover:border-red-500/30 dark:hover:bg-red-500/20"
              startIcon={<Trash2 className="h-4 w-4" />}
              onClick={handleClear}
              type="button"
            >
              Remove
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

export default LogoUploader;
