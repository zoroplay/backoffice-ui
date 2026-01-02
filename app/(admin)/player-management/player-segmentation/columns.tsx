"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Users2, Trash2, AlertTriangle } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

import type { PlayerSegment } from "./data";
 
interface ColumnHandlers {
  onEdit: (segment: PlayerSegment) => void;
  onManagePlayers: (segment: PlayerSegment) => void;
  onDelete: (id: string) => void;
}

// Actions cell component with delete confirmation
const ActionsCell: React.FC<{
  segment: PlayerSegment;
  onEdit: (segment: PlayerSegment) => void;
  onManagePlayers: (segment: PlayerSegment) => void;
  onDelete: (id: string) => void;
}> = ({ segment, onEdit, onManagePlayers, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(segment.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2 ">
        <button
          aria-label="Edit segment"
          className="rounded-md border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          onClick={() => onEdit(segment)}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          aria-label="Manage players"
          className="rounded-md border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          onClick={() => onManagePlayers(segment)}
        >
          <Users2 className="h-4 w-4" />
        </button>
        <button
          aria-label="Remove segment"
          className="rounded-md border border-gray-200 p-2 text-error-500 transition hover:bg-error-100 dark:border-gray-700 dark:hover:bg-error-500/10"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} size="md">
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-100 dark:bg-error-500/20">
              <AlertTriangle className="h-5 w-5 text-error-600 dark:text-error-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Segment
              </h3>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete the segment <span className="font-semibold text-gray-900 dark:text-white">"{segment.name}"</span>? This action cannot be undone.
          </p>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmDelete}
            className="bg-error-500 text-white hover:bg-error-600"
          >
            Delete Segment
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export function createColumns({
  onEdit,
  onManagePlayers,
  onDelete,
}: ColumnHandlers): ColumnDef<PlayerSegment>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "minOdd",
      header: "Min. Odd",
      cell: ({ row }) => row.original.minOdd.toFixed(2),
    },
    {
      accessorKey: "minSelection",
      header: "Min. Selection",
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ActionsCell segment={row.original} onEdit={onEdit} onManagePlayers={onManagePlayers} onDelete={onDelete} />,
    },
  ];
}

