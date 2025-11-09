"use client";

import React, { useMemo, useState } from "react";
import Select, { type SingleValue } from "react-select";
import type { Range } from "react-date-range";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DateRangeFilter, defaultDateRange } from "@/components/common/DateRangeFilter";
import { FilterActions } from "@/components/common/FilterActions";
import { DataTable } from "@/components/tables/DataTable";
import Button from "@/components/ui/button/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { withAuth } from "@/utils/withAuth";
import { Plus } from "lucide-react";
import { columns, PoolsTicketRow } from "./columns";
import { PoolsTicket, poolsTicketsData } from "./data";

type FilterOption = { value: string; label: string };

const filterOptions: { label: string; options: FilterOption[] }[] = [
  {
    label: "Channel",
    options: [
      { value: "channel:Online", label: "Online" },
      { value: "channel:Retail", label: "Retail" },
    ],
  },
  {
    label: "Status",
    options: [
      { value: "status:Won", label: "Won" },
      { value: "status:Lost", label: "Lost" },
      { value: "status:Pending", label: "Pending" },
    ],
  },
  {
    label: "Division",
    options: [
      { value: "division:Premier League", label: "Premier League" },
      { value: "division:La Liga", label: "La Liga" },
      { value: "division:Serie A", label: "Serie A" },
      { value: "division:Bundesliga", label: "Bundesliga" },
      { value: "division:Ligue 1", label: "Ligue 1" },
      { value: "division:Championship", label: "Championship" },
    ],
  },
];

const mapTicketToRow = (ticket: PoolsTicket): PoolsTicketRow => ({
  id: ticket.id,
  ticketRef: ticket.ticketRef,
  player: ticket.player,
  channel: ticket.channel,
  division: ticket.division,
  stake: ticket.stake,
  potentialWinning: ticket.potentialWinning,
  datePlaced: ticket.datePlaced,
  status: ticket.status,
  selections: ticket.selections,
  agent: ticket.agent,
});

function PoolsTicketsPage() {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(null);
  const [filteredRows, setFilteredRows] = useState<PoolsTicketRow[]>(poolsTicketsData.map(mapTicketToRow));
  const [selectedRow, setSelectedRow] = useState<PoolsTicketRow | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const filterData = (filter: FilterOption | null, range: Range | null) => {
    let data = poolsTicketsData.slice();

    if (filter) {
      const [filterType, filterValue] = filter.value.split(":");

      if (filterType === "channel") {
        data = data.filter((ticket) => ticket.channel === filterValue);
      } else if (filterType === "status") {
        data = data.filter((ticket) => ticket.status === filterValue);
      } else if (filterType === "division") {
        data = data.filter((ticket) => ticket.division === filterValue);
      }
    }

    if (range && range.startDate && range.endDate) {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      data = data.filter((ticket) => {
        const placedDate = new Date(ticket.datePlaced);
        return placedDate >= start && placedDate <= end;
      });
    }

    return data.map(mapTicketToRow);
  };

  const handleSearch = () => {
    setFilteredRows(filterData(selectedFilter, dateRange));
  };

  const handleClear = () => {
    setSelectedFilter(null);
    setDateRange(defaultDateRange);
    setFilteredRows(poolsTicketsData.map(mapTicketToRow));
  };

  const summary = useMemo(() => {
    const totalStake = filteredRows.reduce((acc, ticket) => acc + ticket.stake, 0);
    const totalPotential = filteredRows.reduce((acc, ticket) => acc + ticket.potentialWinning, 0);
    const wonCount = filteredRows.filter((ticket) => ticket.status === "Won").length;
    const pendingCount = filteredRows.filter((ticket) => ticket.status === "Pending").length;
    return {
      totalStake,
      totalPotential,
      wonCount,
      pendingCount,
    };
  }, [filteredRows]);

  const handleOpenTicketModal = (ticket: PoolsTicketRow) => {
    setSelectedRow(ticket);
    setIsTicketModalOpen(true);
  };

  const handleCloseTicketModal = () => {
    setSelectedRow(null);
    setIsTicketModalOpen(false);
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Pools Tickets" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4"> 
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Monitoring</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track player stakes, potential winnings, and statuses across online and retail channels.
            </p>
          </div>
          <Button 
          onClick={() => setIsTicketModalOpen(true)} className="bg-brand-500 text-white hover:bg-brand-600"
          startIcon={<Plus size={16} />}
          >
            New Manual Ticket
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Stake</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              ₦{summary.totalStake.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Potential Winning</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              ₦{summary.totalPotential.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Won Tickets</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.wonCount}</p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Tickets</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <DateRangeFilter range={dateRange} onChange={(range) => setDateRange(range)} />
            <div className="w-[20rem]">
              <Select<FilterOption, false>
                styles={reactSelectStyles(theme)}
                options={filterOptions}
                placeholder="Filter by Channel,Status or Division"
                value={selectedFilter}
                onChange={(value: SingleValue<FilterOption>) => setSelectedFilter(value ?? null)}
                isClearable
              />
            </div>
          </div>

          <FilterActions onSearch={handleSearch} onClear={handleClear} />
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/70">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Tickets</h3>
          </div>
          <DataTable
            columns={columns}
            data={filteredRows}
            onRowClick={(row) => handleOpenTicketModal(row.original)}
          />
        </div>
      </div>

      <Modal isOpen={isTicketModalOpen} onClose={handleCloseTicketModal} size="lg">
        <ModalHeader>{selectedRow ? "Ticket Details" : "Create Manual Ticket"}</ModalHeader>
        <ModalBody>
          {selectedRow ? (
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Ticket Reference</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{selectedRow.ticketRef}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{selectedRow.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Player</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.player}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Channel</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.channel}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Division</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.division}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Selections</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.selections}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Stake</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    ₦{selectedRow.stake.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Potential Winning</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    ₦{selectedRow.potentialWinning.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Placed On</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {new Date(selectedRow.datePlaced).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Agent</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.agent ?? "Self"}</p>
                </div>
              </div>
            </div>
          ) : (
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                alert("Manual ticket captured successfully! (mock)");
                handleCloseTicketModal();
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="ticketRef">Ticket Reference</Label>
                  <Input id="ticketRef" placeholder="POOL-XXXXX" />
                </div>
                <div>
                  <Label htmlFor="playerName">Player Name</Label>
                  <Input id="playerName" placeholder="Player full name" />
                </div>
                <div>
                  <Label htmlFor="stake">Stake Amount</Label>
                  <Input id="stake" type="number" min={0} placeholder="₦0.00" />
                </div>
                <div>
                  <Label htmlFor="potentialWin">Potential Winning</Label>
                  <Input id="potentialWin" type="number" min={0} placeholder="₦0.00" />
                </div>
                <div>
                  <Label>Channel</Label>
                  <Select
                    styles={reactSelectStyles(theme)}
                    options={[
                      { value: "Online", label: "Online" },
                      { value: "Retail", label: "Retail" },
                    ]}
                    placeholder="Select channel"
                  />
                </div>
                <div>
                  <Label>Division</Label>
                  <Select
                    styles={reactSelectStyles(theme)}
                    options={[
                      { value: "Premier League", label: "Premier League" },
                      { value: "La Liga", label: "La Liga" },
                      { value: "Serie A", label: "Serie A" },
                      { value: "Bundesliga", label: "Bundesliga" },
                    ]}
                    placeholder="Select division"
                  />
                </div>
                <div>
                  <Label htmlFor="selections">Selections Count</Label>
                  <Input id="selections" type="number" min={1} placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="agent">Agent (Optional)</Label>
                  <Input id="agent" placeholder="Agent name or code" />
                </div>
              </div>
            </Form>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={handleCloseTicketModal} type="button">
            Close
          </Button>
          {!selectedRow && (
            <Button type="submit" form="manual-ticket-form" className="bg-brand-500 text-white hover:bg-brand-600">
              Save Ticket
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default withAuth(PoolsTicketsPage);

