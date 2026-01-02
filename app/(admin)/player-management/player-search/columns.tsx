"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Badge from "@/components/ui/badge/Badge";
import React, { useState, useRef, useEffect } from "react";

export type Player = {
  code: string;
  username: string;
  fullName: string;
  playerStatus: string;
  email: string;
  phone: string;
  registeredOn: string;
  country: string;
  currency: string;
  verificationStatus: string;
};

// Dropdown cell component
const ActionsCell = ({ player }: { player: Player }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - containerRect.bottom;
        const spaceAbove = containerRect.top;
        
        // More accurate dropdown height estimation (header + 6 items + padding)
        const estimatedDropdownHeight = 280;
        const buffer = 30; // Extra buffer for safety
        
        // Only position on top if we're really at the bottom of the viewport
        // Be very conservative - only flip if there's clearly not enough space below
        // and clearly enough space above
        const needsTopPosition = 
          spaceBelow < estimatedDropdownHeight && // Not enough space below
          spaceAbove >= estimatedDropdownHeight + buffer && // Enough space above with buffer
          spaceBelow < spaceAbove - 100; // Above has significantly more space (100px difference)

        setPosition(needsTopPosition ? "top" : "bottom");
      });
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="outline"
        size="sm"
        className="dropdown-toggle flex items-center gap-1 text-xs"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="h-4 w-4" />       
      </Button>

      <Dropdown 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        position={position} 
        anchorRef={containerRef as React.RefObject<HTMLElement>}
        className="w-48"
      >
        <div className="py-2">
          <div className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            Quick Actions
          </div>
          <div className="my-1 h-px bg-gray-200 dark:bg-gray-700 dark:text-white" />

          <DropdownItem
            onClick={() => {
              console.log("Change Password", player);
              setIsOpen(false);
            }}
          >
            Change Password
          </DropdownItem>

          <DropdownItem
            onClick={() => {
              console.log("Manual Deposit", player);
              setIsOpen(false);
            }}
          >
            Manual Deposit
          </DropdownItem>

          <DropdownItem
            onClick={() => {
              console.log("Manual Withdrawal", player);
              setIsOpen(false);
            }}
          >
            Manual Withdrawal
          </DropdownItem>

          <DropdownItem
            onClick={() => {
              console.log("Edit Information", player);
              setIsOpen(false);
            }}
          >
            Edit Information
          </DropdownItem>

          <DropdownItem
            onClick={() => {
              console.log("Activate Account", player);
              setIsOpen(false);
            }}
          >
            Activate Account
          </DropdownItem>

          <DropdownItem
            onClick={() => {
              console.log("Give Bonus", player);
              setIsOpen(false);
            }}
          >
            Give Bonus
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
};

export const columns: ColumnDef<Player>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "playerStatus",
    header: "Player Status",
    cell: ({ row }) => {
      const status = row.original.playerStatus
      return (
        <Badge
          variant="light"
          color={
            status === "Active"
              ? "success"
              : "error"            
              }
        >
          {status}
        </Badge>
      )
    },
  },

  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
  },
  {
    accessorKey: "registeredOn",
    header: "Registered On",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "verificationStatus",
    header: "Verification Status",
  },
  {
    id: "actions",
    header: "Quick Actions",
    cell: ({ row }) => <ActionsCell player={row.original} />,
  },
];