"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import Button from "@/components/ui/button/Button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Badge from "@/components/ui/badge/Badge";
import type { OnlinePlayer } from "./data";


const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status.trim().toLowerCase();

  return (
    <Badge
      variant="light"
      color={normalizedStatus === "active" ? "success" : "error"}
      // size="sm"
    >
      {status}
    </Badge>
  );
};


const VerifiedBadge = ({ verified }: { verified: string }) => {
  const isVerified = verified.trim().toLowerCase() === "yes";

  return (
    <Badge
      variant="light"
      color={isVerified ? "primary" : "light"}
     >
      {isVerified ? "Yes" : "No"}
    </Badge>
  );
};


const ActionsCell = ({ player }: { player: OnlinePlayer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: string) => {
    console.log(`${action}:`, player);
    setIsOpen(false);
  };

  const actions = [
    "Change Password",
    "Manual Deposit",
    "Manual Withdrawal",
    "Edit Information",
    "Activate Account",
    "Give Bonus",
  ];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="dropdown-toggle flex items-center gap-1 text-xs"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-48">
        <div className="py-2">
          <div className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            Quick Actions
          </div>
          <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

          {actions.map((action) => (
            <DropdownItem key={action} onClick={() => handleAction(action)}>
              {action}
            </DropdownItem>
          ))}
        </div>
      </Dropdown>
    </div>
  );
};


export const columns: ColumnDef<OnlinePlayer>[] = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "dateJoined",
    header: "Date Joined",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "balance",
    header: "Balance (₦)",
    cell: ({ getValue }) => `${Number(getValue()).toLocaleString()}`,
  },
  {
    accessorKey: "bonuses",
    header: "Bonuses (₦)",
    cell: ({ getValue }) => `${Number(getValue()).toLocaleString()}`,
  },
  {
    accessorKey: "lifetimeDeposits",
    header: "Lifetime Deposits (₦)",
    cell: ({ getValue }) => `${Number(getValue()).toLocaleString()}`,
  },
  {
    accessorKey: "lifetimeWithdrawals",
    header: "Lifetime Withdrawals (₦)",
    cell: ({ getValue }) => `${Number(getValue()).toLocaleString()}`,
  },
  {
    accessorKey: "openBets",
    header: "Open Bets",
  },
  {
    accessorKey: "verified",
    header: "Verified",
    cell: ({ row }) => <VerifiedBadge verified={row.original.verified} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Quick Actions",
    cell: ({ row }) => <ActionsCell player={row.original} />,
  },
];
