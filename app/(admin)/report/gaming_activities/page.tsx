"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import React from "react";
import { withAuth } from "@/utils/withAuth";
import { useState } from "react";
import { DateRangePicker } from "react-date-range";
import Select from "react-select";
import Input from "@/components/form/input/InputField";

interface TableHeaderTypes {
  title: string;
  key: string;
}

const tableHeader: TableHeaderTypes[] = [
  { title: "Group", key: "group" },
  { title: "of Bets", key: "bets" },
  { title: "Turnover", key: "turnover" },
  { title: "winnings", key: "winnings" },
  { title: "GGR", key: "ggr" },
  { title: "margin", key: "margin" },
];

export interface TableDataTypes {
  group: number;
  bets: number;
  turnover: number;
  winnings: number;
  ggr: number;
  margin: string;
}

// Define the table data using the interface
const tableData: TableDataTypes[] = [
  {
    group: 1,
    bets: 0.0,
    turnover: 0.0,
    winnings: 0.0,
    margin: "3.9K",
    ggr: 0.0,
  },
  {
    group: 2,
    bets: 0.0,
    turnover: 0.0,
    winnings: 0.0,
    margin: "3.9K",
    ggr: 0.0,
  },
  {
    group: 3,
    bets: 0.0,
    turnover: 0.0,
    winnings: 0.0,
    margin: "3.9K",
    ggr: 0.0,
  },
  {
    group: 4,
    bets: 0.0,
    turnover: 0.0,
    winnings: 0.0,
    margin: "3.9K",
    ggr: 0.0,
  },
  {
    group: 5,
    bets: 0.0,
    turnover: 0.0,
    winnings: 0.0,
    margin: "3.9K",
    ggr: 0.0,
  },
];

const gameOptions = [
  { value: "Sport", label: "Sport" },
  { value: "Casino", label: "Casino" },
  { value: "Games", label: "Games" },
  { value: "Virtual Sport", label: "Virtual Sport" },
];

const matchOptions = [
  { value: "All", label: "All" },
  { value: "Pre Match", label: "Pre Match" },
  { value: "Live", label: "Live" },
];

const TicketOption = [
  { value: "Real", label: "Real" },
  { value: "Simulated", label: "Simulated" },
];

const betOptions = [
  { value: "Single", label: "Single" },
  { value: "Combo", label: "Combo" },
];

const clientOption = [
  { value: "Website", label: "Website" },
  { value: "Mobile", label: "Mobile" },
  { value: "Cashier", label: "Cashier" },
];

function GamingActivities() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  interface SelectionRange {
    startDate: Date;
    endDate: Date;
    key: string;
  }

  interface Ranges {
    selection: SelectionRange;
  }

  const handleSelect = (ranges: Ranges): void => {
    const { startDate, endDate } = ranges.selection;

    // Ensure both startDate and endDate are selected before closing the calendar
    if (startDate && endDate) {
      setSelectionRange({
        startDate,
        endDate,
        key: "selection",
      });
      setIsCalendarOpen(false); // Close the calendar
    }
  };

  const handleInputClick = () => {
    setIsCalendarOpen(true); // Open the calendar when the input is clicked
  };

  return (
    <div>
      <div className="flex relative">
        <input
          type="text"
          value={`${selectionRange.startDate.toLocaleDateString()} - ${selectionRange.endDate.toLocaleDateString()}`}
          readOnly
          onClick={handleInputClick} // Open calendar on input click
          className="border py-2 pl-3 rounded focus:outline-none focus:ring focus:ring-zinc-500"
          placeholder="Select date range"
        />
        {isCalendarOpen && (
          <div className="absolute top-full left-0 mt-2 z-10">
            <DateRangePicker
              ranges={[selectionRange]}
              onChange={handleSelect}
              showSelectionPreview={true}
              showMonthAndYearPickers={true}
              className="shadow-lg border rounded"
            />
          </div>
        )}

        <div className="flex ml-4 space-x-4">
          <Select
            className="w-[13rem] rounded focus:outline-none focus:ring focus:ring-zinc-500"
            options={gameOptions}
            placeholder="Game Type"
          />
          <Select
            className="w-[13rem] rounded focus:outline-none focus:ring focus:ring-zinc-500"
            options={matchOptions}
            placeholder="Match Type"
          />
          <Select
            className="w-[13rem] rounded focus:outline-none focus:ring focus:ring-zinc-500"
            options={TicketOption}
            placeholder="Ticket Type"
          />
          <Select
            className="w-[13rem] rounded focus:outline-none focus:ring focus:ring-zinc-500"
            options={betOptions}
            placeholder="Bet Type"
          />
          <Select
            className="w-[13rem] rounded focus:outline-none focus:ring focus:ring-zinc-500"
            options={clientOption}
            placeholder="Client Type"
          />
        </div>
      </div>
      <div className="flex ml-auto space-x-4 py-4">
        <Select
          className="w-[25rem] rounded focus:outline-none focus:ring focus:ring-zinc-500"
          options={[
            { value: "Sport", label: "Sport" },
            { value: "League", label: "League" },
            { value: "Market", label: "Market" },
          ]}
          isMulti
          placeholder="Multiple Select"
        />
        <Select
          className="w-[13rem] rounded focus:outline-none focus:ring focus:ring-zinc-500"
          options={[
            { value: "Real Money", label: "Real Money" },
            { value: "Bonus Money", label: "Bonus Money" },
          ]}
          placeholder="Money Type"
        />
        {/* <Input
          type="text"
          placeholder=""
          // onClick={} // Open calendar on input click
          className="border py-1 pl-3 rounded focus:outline-none focus:ring focus:ring-zinc-500"
        /> */}
        <form>
          <div className="relative">
            <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
              <svg
                className="fill-gray-500 dark:fill-gray-400"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                  fill=""
                />
              </svg>
            </span>
            <input
              // ref={inputRef}
              type="text"
              placeholder="Search or type command..."
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
            />

            <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
              <span> ⌘ </span>
              <span> K </span>
            </button>
          </div>
        </form>
      </div>

      <PageBreadcrumb pageTitle="Gaming Activities" />
      <div className="space-y-6">
        <ComponentCard title="">
          <BasicTableOne tableHeader={tableHeader} tableData={tableData} />
        </ComponentCard>
      </div>
    </div>
  );
}

export default withAuth(GamingActivities);
