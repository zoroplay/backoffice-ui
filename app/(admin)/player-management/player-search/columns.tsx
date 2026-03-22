"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Badge from "@/components/ui/badge/Badge";
import React, { useEffect, useRef, useState } from "react";

export type Player = {
  id: number;
  code: string;
  username: string;
  fullName: string;
  status: number;
  playerStatus: string;
  email: string;
  phone: string;
  registeredOn: string;
  country: string;
  currency: string;
  verified: number;
  verificationStatus: string;
};

type PlayerActionCallbacks = {
  onChangePassword: (player: Player) => void;
  onManualDeposit: (player: Player) => void;
  onManualWithdrawal: (player: Player) => void;
  onGiveBonus: (player: Player) => void;
  onVerifyUser: (player: Player) => void;
  onFreezeUser: (player: Player) => void;
  onUnfreezeUser: (player: Player) => void;
  onTerminateUser: (player: Player) => void;
};

const statusBadgeColor = (status: number): "success" | "warning" | "error" => {
  if (status === 1) return "success";
  if (status === 2) return "warning";
  return "error";
};

const ActionsCell = ({
  player,
  callbacks,
}: {
  player: Player;
  callbacks: PlayerActionCallbacks;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      requestAnimationFrame(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - containerRect.bottom;
        const spaceAbove = containerRect.top;
        const estimatedDropdownHeight = 320;
        const buffer = 30;

        const needsTopPosition =
          spaceBelow < estimatedDropdownHeight &&
          spaceAbove >= estimatedDropdownHeight + buffer &&
          spaceBelow < spaceAbove - 100;

        setPosition(needsTopPosition ? "top" : "bottom");
      });
    }
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="outline"
        size="sm"
        className="dropdown-toggle flex items-center gap-1 text-xs"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeMenu}
        position={position}
        anchorRef={containerRef as React.RefObject<HTMLElement>}
        className="w-52"
      >
        <div className="py-2">
          <div className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
            Quick Actions
          </div>
          <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

          <DropdownItem
            onClick={() => {
              callbacks.onChangePassword(player);
              closeMenu();
            }}
          >
            Change Password
          </DropdownItem>

          <DropdownItem
            onClick={() => {
              callbacks.onManualDeposit(player);
              closeMenu();
            }}
          >
            Manual Deposit
          </DropdownItem>

          <DropdownItem
            onClick={() => {
              callbacks.onManualWithdrawal(player);
              closeMenu();
            }}
          >
            Manual Withdrawal
          </DropdownItem>

          <DropdownItem
            onClick={() => {
              callbacks.onGiveBonus(player);
              closeMenu();
            }}
          >
            Give Bonus
          </DropdownItem>

          {player.verified !== 1 ? (
            <DropdownItem
              onClick={() => {
                callbacks.onVerifyUser(player);
                closeMenu();
              }}
            >
              Verify User
            </DropdownItem>
          ) : null}

          {player.status === 2 ? (
            <DropdownItem
              onClick={() => {
                callbacks.onUnfreezeUser(player);
                closeMenu();
              }}
            >
              Unfreeze Account
            </DropdownItem>
          ) : (
            <DropdownItem
              onClick={() => {
                callbacks.onFreezeUser(player);
                closeMenu();
              }}
            >
              Freeze Account
            </DropdownItem>
          )}

          {player.status !== 2 && player.status !== 3 ? (
            <DropdownItem
              onClick={() => {
                callbacks.onTerminateUser(player);
                closeMenu();
              }}
            >
              Terminate Account
            </DropdownItem>
          ) : null}
        </div>
      </Dropdown>
    </div>
  );
};

export const createColumns = (
  callbacks: PlayerActionCallbacks
): ColumnDef<Player>[] => [
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
    cell: ({ row }) => (
      <Badge variant="light" color={statusBadgeColor(row.original.status)}>
        {row.original.playerStatus}
      </Badge>
    ),
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
    cell: ({ row }) => {
      const raw = row.original.registeredOn;
      const parsed = new Date(raw);
      if (Number.isNaN(parsed.getTime())) return raw;

      return parsed.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
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
    cell: ({ row }) => <ActionsCell player={row.original} callbacks={callbacks} />,
  },
];
