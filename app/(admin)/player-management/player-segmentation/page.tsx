"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Users2, Trash2, Upload, Gift } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useSearch } from "@/context/SearchContext";
import { withAuth } from "@/utils/withAuth";

import {
  PlayerSegment,
  SegmentPlayer,
  playerSegments as initialSegments,
} from "./data";

interface SegmentFormState {
  id?: string;
  name: string;
  minOdd: string;
  minSelection: string;
  errorMessage: string;
}

const bonusOptions = [
  { label: "Weekly Cashback", value: "cashback" },
  { label: "Free Bets", value: "free-bet" },
  { label: "VIP Gift", value: "vip-gift" },
];

function PlayerSegmentationPage() {
  const [segments, setSegments] = useState<PlayerSegment[]>(initialSegments);
  const [filteredSegments, setFilteredSegments] = useState<PlayerSegment[]>(initialSegments);

  const [isSegmentModalOpen, setSegmentModalOpen] = useState(false);
  const [segmentForm, setSegmentForm] = useState<SegmentFormState>({
    name: "",
    minOdd: "",
    minSelection: "",
    errorMessage: "",
  });

  const [isManagePlayersOpen, setManagePlayersOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState<PlayerSegment | null>(null);
  const [playerSearch, setPlayerSearch] = useState("");

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isBonusModalOpen, setBonusModalOpen] = useState(false);
  const [bonusForm, setBonusForm] = useState({ bonus: "", amount: "0" });

  const { query, setPlaceholder, resetPlaceholder } = useSearch();

  const resetSegmentForm = useCallback(() => {
    setSegmentForm({
      id: undefined,
      name: "",
      minOdd: "",
      minSelection: "",
      errorMessage: "",
    });
  }, []);

  const handleAddSegment = useCallback(() => {
    resetSegmentForm();
    setSegmentModalOpen(true);
  }, [resetSegmentForm]);

  const handleEditSegment = useCallback((segment: PlayerSegment) => {
    setSegmentForm({
      id: segment.id,
      name: segment.name,
      minOdd: segment.minOdd.toString(),
      minSelection: segment.minSelection.toString(),
      errorMessage: segment.errorMessage,
    });
    setSegmentModalOpen(true);
  }, []);

  const handleManagePlayers = useCallback((segment: PlayerSegment) => {
    setActiveSegment(segment);
    setPlayerSearch("");
    setManagePlayersOpen(true);
  }, []);

  const handleDeleteSegment = useCallback((id: string) => {
    setSegments((prev) => prev.filter((segment) => segment.id !== id));
  }, []);

  useEffect(() => {
    setPlaceholder("Search by Name or Created By");

    return () => {
      resetPlaceholder();
    };
  }, [resetPlaceholder, setPlaceholder]);

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setFilteredSegments(segments);
      return;
    }

    setFilteredSegments(
      segments.filter((segment) =>
        [segment.name, segment.createdBy]
          .map((field) => field.toLowerCase())
          .some((field) => field.includes(trimmed))
      )
    );
  }, [query, segments]);

  const columns = useMemo<ColumnDef<PlayerSegment>[]>(
    () => [
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
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2 ">
            <button
              aria-label="Edit segment"
              className="rounded-md border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => handleEditSegment(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              aria-label="Manage players"
              className="rounded-md border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => handleManagePlayers(row.original)}
            >
              <Users2 className="h-4 w-4" />
            </button>
            <button
              aria-label="Remove segment"
              className="rounded-md border border-gray-200 p-2 text-error-500 transition hover:bg-error-100 dark:border-gray-700 dark:hover:bg-error-500/10"
              onClick={() => handleDeleteSegment(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [handleDeleteSegment, handleEditSegment, handleManagePlayers]
  );

  function handleSegmentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const minOdd = parseFloat(segmentForm.minOdd);
    const minSelection = parseInt(segmentForm.minSelection, 10);

    if (!segmentForm.name.trim() || Number.isNaN(minOdd) || Number.isNaN(minSelection)) {
      return;
    }

    if (segmentForm.id) {
      setSegments((prev) =>
        prev.map((segment) =>
          segment.id === segmentForm.id
            ? {
                ...segment,
                name: segmentForm.name.trim(),
                minOdd,
                minSelection,
                errorMessage: segmentForm.errorMessage,
              }
            : segment
        )
      );
    } else {
      const newSegment: PlayerSegment = {
        id: `seg-${Date.now()}`,
        name: segmentForm.name.trim(),
        minOdd,
        minSelection,
        createdBy: "You",
        errorMessage: segmentForm.errorMessage,
        players: [],
      };

      setSegments((prev) => [newSegment, ...prev]);
    }

    setSegmentModalOpen(false);
    resetSegmentForm();
  }

  const visiblePlayers: SegmentPlayer[] = useMemo(() => {
    const list = activeSegment?.players ?? [];
    const trimmed = playerSearch.trim().toLowerCase();

    if (!trimmed) {
      return list;
    }

    return list.filter((player) => player.username.toLowerCase().includes(trimmed));
  }, [activeSegment?.players, playerSearch]);

  useEffect(() => {
    if (!isSegmentModalOpen && !isManagePlayersOpen && !isUploadModalOpen && !isBonusModalOpen) {
      setSelectedFile(null);
    }
  }, [isSegmentModalOpen, isManagePlayersOpen, isUploadModalOpen, isBonusModalOpen]);

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Player Segmentation" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create rules to group players and manage bonuses or campaigns for each segment.
        </p>
        <Button
          variant="primary"
          className="inline-flex items-center gap-2"
          onClick={handleAddSegment}
        >
        <Plus className="h-4 w-4" />
          New Segment
        </Button>
      </div>

      <DataTable columns={columns} data={filteredSegments} />

      {/* Add / Edit Segment */}
      <Modal isOpen={isSegmentModalOpen} onClose={() => setSegmentModalOpen(false)} className="!max-w-lg">
        <div className="w-full px-4 py-6 sm:px-6 sm:py-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {segmentForm.id ? "Edit Player Segment" : "Add Player Segment"}
          </h2>

          <form className="mt-6 space-y-4" onSubmit={handleSegmentSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <input
                type="text"
                value={segmentForm.name}
                onChange={(event) =>
                  setSegmentForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter a segment name"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Min odd per game
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={segmentForm.minOdd}
                  onChange={(event) =>
                    setSegmentForm((prev) => ({ ...prev, minOdd: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="e.g. 2.5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Min selection per ticket
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={segmentForm.minSelection}
                  onChange={(event) =>
                    setSegmentForm((prev) => ({ ...prev, minSelection: event.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="e.g. 3"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Error message
              </label>
              <textarea
                value={segmentForm.errorMessage}
                onChange={(event) =>
                  setSegmentForm((prev) => ({ ...prev, errorMessage: event.target.value }))
                }
                className="h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Custom error message when rules are not met"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSegmentModalOpen(false);
                  resetSegmentForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Segment
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Manage Players */}
      <Modal isOpen={isManagePlayersOpen} onClose={() => setManagePlayersOpen(false)} className="!max-w-lg">
        <div className="w-full px-4 py-6 sm:px-6 sm:py-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Manage Players for {activeSegment?.name}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className="inline-flex items-center gap-2"
              onClick={() => setUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Upload Players
            </Button>
            <Button
              variant="primary"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600"
              onClick={() => setBonusModalOpen(true)}
            >
              <Gift className="h-4 w-4" />
              Assign Bonus
            </Button>
          </div>

          <div className="mt-6">
            <input
              type="text"
              value={playerSearch}
              onChange={(event) => setPlayerSearch(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="Search players"
            />
          </div>

          <div className="mt-6 space-y-3">
            {visiblePlayers.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No players have been added to this segment yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {visiblePlayers.map((player) => (
                  <li
                    key={player.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm dark:border-gray-700"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {player.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Status: {player.status}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!activeSegment) return;
                        setSegments((prev) =>
                          prev.map((segment) =>
                            segment.id === activeSegment.id
                              ? {
                                  ...segment,
                                  players: segment.players.filter((p) => p.id !== player.id),
                                }
                              : segment
                          )
                        );
                        setActiveSegment((prev) =>
                          prev
                            ? {
                                ...prev,
                                players: prev.players.filter((p) => p.id !== player.id),
                              }
                            : prev
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>

      {/* Upload Players */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} className="!max-w-md">
        <div className="w-full px-4 py-6 sm:px-6 sm:py-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Players</h3>
          <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            <span>Choose a CSV file or drop it here</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selected file: {selectedFile ? selectedFile.name : "No file selected"}
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setUploadModalOpen(false);
              }}
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Bonus */}
      <Modal isOpen={isBonusModalOpen} onClose={() => setBonusModalOpen(false)} className="!max-w-md">
        <div className="w-full px-4 py-6 sm:px-6 sm:py-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Mass Bonus</h3>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bonus</label>
            <select
              value={bonusForm.bonus}
              onChange={(event) => setBonusForm((prev) => ({ ...prev, bonus: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Select a bonus</option>
              {bonusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={bonusForm.amount}
              onChange={(event) => setBonusForm((prev) => ({ ...prev, amount: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setBonusModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setBonusModalOpen(false);
              }}
            >
              Assign Bonus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(PlayerSegmentationPage);

