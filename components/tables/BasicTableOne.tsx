import React from "react";
import {
  TableDataTypes,
  TableHeaderTypes,
} from "@/app/(admin)/report/gaming_activities";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function BasicTableOne({
  tableHeader,
  tableData,
}: {
  tableHeader: TableHeaderTypes;
  tableData: TableDataTypes;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {tableHeader.map((header: TableHeaderTypes, i: number) => (
                  <TableCell
                    key={i}
                    isHeader
                    className="px-5 py-3 font-bold text-black text-sm  text-start dark:text-gray-400"
                  >
                    {header.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((rowData: TableDataTypes, rowIndex: number) => (
                <TableRow key={`table_data_${rowIndex}`}>
                  {tableHeader.map(
                    (header: TableHeaderTypes, colIndex: number) => (
                      <TableCell
                        key={`table_data_${rowIndex}_${colIndex}`}
                        className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                      >
                        {rowData[header.key]}
                      </TableCell>
                    )
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
