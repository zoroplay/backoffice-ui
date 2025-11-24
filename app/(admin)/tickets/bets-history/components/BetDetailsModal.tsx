"use client";

import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import type { BetHistory } from "../columns";

interface BetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bet: BetHistory | null;
}

const BetDetailsModal: React.FC<BetDetailsModalProps> = ({
  isOpen,
  onClose,
  bet,
}) => {
  if (!bet) return null;

  const getStatusColor = (status: string) => {
    if (status === "Won") return "success";
    if (status === "Lost") return "error";
    return "info";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalHeader>Bet Details - {bet.betslipId}</ModalHeader>

      <ModalBody>
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Bet Status
            </span>
            <Badge
              variant="light"
              color={getStatusColor(bet.betStatus)}
            >
              {bet.betStatus}
            </Badge>
          </div>

          {/* Bet Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Betslip ID
              </span>
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {bet.betslipId}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Bet Type
              </span>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {bet.betType}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Placed On
              </span>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {bet.placedOn}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Placed By
              </span>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {bet.placedBy}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Client Type
              </span>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {bet.clientType}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Odds
              </span>
              <p className="text-base text-gray-900 dark:text-gray-100">
                {bet.odds.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Financial Information */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Financial Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Stake
                </span>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  ₦{bet.stake.toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Returns
                </span>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  ₦{bet.returns.toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Win/Loss
                </span>
                <p
                  className={`text-base font-semibold ${
                    bet.winLoss.startsWith("+")
                      ? "text-green-600 dark:text-green-400"
                      : bet.winLoss.startsWith("-")
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {bet.winLoss === "—" || bet.winLoss === "-"
                    ? "—"
                    : bet.winLoss.startsWith("+") || bet.winLoss.startsWith("-")
                    ? `${bet.winLoss.slice(0, 1)}₦${parseInt(bet.winLoss.replace(/[+-]/g, "")).toLocaleString()}`
                    : `₦${bet.winLoss}`}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Bonus
                </span>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  ₦{bet.bonus.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Sport Information */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Sport Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sport
                </span>
                <p className="text-base text-gray-900 dark:text-gray-100">
                  {bet.sport}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  League
                </span>
                <p className="text-base text-gray-900 dark:text-gray-100">
                  {bet.league}
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Event
                </span>
                <p className="text-base text-gray-900 dark:text-gray-100">
                  {bet.event}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Market
                </span>
                <p className="text-base text-gray-900 dark:text-gray-100">
                  {bet.market}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Lost Events
                </span>
                <p className="text-base text-gray-900 dark:text-gray-100">
                  {bet.lostEvents}
                </p>
              </div>
            </div>
          </div>

          {/* Settlement Information */}
          {bet.settledAt && bet.settledAt !== "-" && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Bet Settled Date & Time
                </span>
                <p className="text-base text-gray-900 dark:text-gray-100">
                  {bet.settledAt}
                </p>
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default BetDetailsModal;

