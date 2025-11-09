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

import { columns, CouponTicketRow } from "./columns";
import { CouponTicket, couponTicketsData } from "./data";

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
      { value: "status:Settled", label: "Settled" },
      { value: "status:Pending", label: "Pending" },
    ],
  },
  {
    label: "Region",
    options: [
      { value: "region:Lagos", label: "Lagos" },
      { value: "region:Abuja", label: "Abuja" },
      { value: "region:Port Harcourt", label: "Port Harcourt" },
      { value: "region:Kano", label: "Kano" },
      { value: "region:Kaduna", label: "Kaduna" },
      { value: "region:Benin", label: "Benin" },
    ],
  },
];

const mapTicketToRow = (ticket: CouponTicket): CouponTicketRow => ({
  id: ticket.id,
  name: ticket.name,
  bets: ticket.bets,
  turnover: ticket.turnover,
  winnings: ticket.winnings,
  ggr: ticket.ggr,
  margin: ticket.margin,
  ngr: ticket.ngr,
  channel: ticket.channel,
  status: ticket.status,
  region: ticket.region,
  date: ticket.date,
});

function CouponTicketsPage() {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState<Range>(defaultDateRange);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(null);
  const [filteredRows, setFilteredRows] = useState<CouponTicketRow[]>(couponTicketsData.map(mapTicketToRow));
  const [selectedRow, setSelectedRow] = useState<CouponTicketRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filterData = (filter: FilterOption | null, range: Range | null) => {
    let data = couponTicketsData.slice();

    if (filter) {
      const [type, value] = filter.value.split(":");

      if (type === "channel") {
        data = data.filter((ticket) => ticket.channel === value);
      } else if (type === "status") {
        data = data.filter((ticket) => ticket.status === value);
      } else if (type === "region") {
        data = data.filter((ticket) => ticket.region === value);
      }
    }

    if (range?.startDate && range.endDate) {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      data = data.filter((ticket) => {
        const ticketDate = new Date(ticket.date);
        return ticketDate >= start && ticketDate <= end;
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
    setFilteredRows(couponTicketsData.map(mapTicketToRow));
  };

  const summary = useMemo(() => {
    const totalBets = filteredRows.reduce((acc, row) => acc + row.bets, 0);
    const totalTurnover = filteredRows.reduce((acc, row) => acc + row.turnover, 0);
    const totalWinnings = filteredRows.reduce((acc, row) => acc + row.winnings, 0);
    const totalGgr = filteredRows.reduce((acc, row) => acc + row.ggr, 0);
    const totalNgr = filteredRows.reduce((acc, row) => acc + row.ngr, 0);
    const avgMargin =
      filteredRows.length > 0
        ? filteredRows.reduce((acc, row) => acc + row.margin, 0) / filteredRows.length
        : 0;

    return {
      totalBets,
      totalTurnover,
      totalWinnings,
      totalGgr,
      totalNgr,
      avgMargin,
    };
  }, [filteredRows]);

  const handleRowClick = (row: CouponTicketRow) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRow(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Coupon Tickets" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Coupon Sales Overview</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monitor coupon performance across regions, channels, and settlement states.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-brand-500 text-white hover:bg-brand-600">
            Raise Manual Coupon
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Bets</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.totalBets.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Turnover</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              ₦{summary.totalTurnover.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Winnings</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              ₦{summary.totalWinnings.toLocaleString()}
            </p>
          </div>
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">NGR</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              ₦{summary.totalNgr.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Margin</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {summary.avgMargin.toFixed(1)}%
            </p>
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
                placeholder="Filter by Channel,Status or Region"
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
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Results</h3>
          </div>
          <DataTable columns={columns} data={filteredRows} onRowClick={(row) => handleRowClick(row.original)} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="lg">
        <ModalHeader>{selectedRow ? "Coupon Ticket Details" : "Create Manual Coupon"}</ModalHeader>
        <ModalBody>
          {selectedRow ? (
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{selectedRow.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{selectedRow.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Channel</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.channel}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Region</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.region}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400"># of Bets</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.bets.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Turnover</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    ₦{selectedRow.turnover.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Winnings</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    ₦{selectedRow.winnings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">GGR</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">₦{selectedRow.ggr.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Margin</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">{selectedRow.margin.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">NGR</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">₦{selectedRow.ngr.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {new Date(selectedRow.date).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Form
              id="coupon-ticket-form"
              onSubmit={(event) => {
                event.preventDefault();
                alert("Manual coupon created! (mock)");
                handleCloseModal();
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="couponName">Coupon Name</Label>
                  <Input id="couponName" placeholder="Name of coupon" />
                </div>
                <div>
                  <Label htmlFor="couponRegion">Region</Label>
                  <Input id="couponRegion" placeholder="e.g. Lagos Mainland" />
                </div>
                <div>
                  <Label htmlFor="couponBets"># of Bets</Label>
                  <Input id="couponBets" type="number" min={0} placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="couponTurnover">Turnover</Label>
                  <Input id="couponTurnover" type="number" min={0} placeholder="₦0.00" />
                </div>
                <div>
                  <Label htmlFor="couponWinnings">Winnings</Label>
                  <Input id="couponWinnings" type="number" min={0} placeholder="₦0.00" />
                </div>
                <div>
                  <Label htmlFor="couponGgr">GGR</Label>
                  <Input id="couponGgr" type="number" min={0} placeholder="₦0.00" />
                </div>
                <div>
                  <Label htmlFor="couponMargin">Margin (%)</Label>
                  <Input id="couponMargin" type="number" min={0} step={0.1} placeholder="0.0" />
                </div>
                <div>
                  <Label htmlFor="couponNgr">NGR</Label>
                  <Input id="couponNgr" type="number" min={0} placeholder="₦0.00" />
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
                  <Label>Status</Label>
                  <Select
                    styles={reactSelectStyles(theme)}
                    options={[
                      { value: "Settled", label: "Settled" },
                      { value: "Pending", label: "Pending" },
                    ]}
                    placeholder="Select status"
                  />
                </div>
              </div>
            </Form>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={handleCloseModal} type="button">
            Close
          </Button>
          {!selectedRow && (
            <Button type="submit" form="coupon-ticket-form" className="bg-brand-500 text-white hover:bg-brand-600">
              Save Coupon
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default withAuth(CouponTicketsPage);

