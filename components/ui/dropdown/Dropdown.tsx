"use client";
import type React from "react";
import { useEffect, useRef } from "react";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  position?: "top" | "bottom";
  anchorRef?: React.RefObject<HTMLElement>;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  position = "bottom",
  anchorRef,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      !(event.target as HTMLElement).closest('.dropdown-toggle')
    ) {
      onClose();
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [onClose]);

  useEffect(() => {
    if (isOpen && position === "top" && anchorRef?.current && dropdownRef.current) {
      // For top positioning, use fixed positioning to escape overflow containers
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const dropdown = dropdownRef.current;
      
      // Calculate position: dropdown bottom should be 8px above button top
      // bottom = viewport height - (button top - 8px gap)
      dropdown.style.position = "fixed";
      dropdown.style.right = `${window.innerWidth - anchorRect.right}px`;
      dropdown.style.bottom = `${window.innerHeight - anchorRect.top + 8}px`;
      dropdown.style.top = "auto";
    } else if (isOpen && dropdownRef.current) {
      // Reset to absolute for bottom positioning
      const dropdown = dropdownRef.current;
      dropdown.style.position = "";
      dropdown.style.right = "";
      dropdown.style.bottom = "";
      dropdown.style.top = "";
    }
  }, [isOpen, position, anchorRef]);

  if (!isOpen) return null;

  const positionClasses = position === "top" 
    ? "" // Position handled by fixed positioning
    : "top-full mt-2";

  return (
    <div
      ref={dropdownRef}
      className={`absolute z-40 right-0 ${positionClasses} rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`}
    >
      {children}
    </div>
  );
};
