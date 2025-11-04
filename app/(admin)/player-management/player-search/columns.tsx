"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Badge from "@/components/ui/badge/Badge";
import { useState } from "react";

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

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="dropdown-toggle flex items-center gap-1 text-xs"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="h-4 w-4" />       
      </Button>

      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-48">
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