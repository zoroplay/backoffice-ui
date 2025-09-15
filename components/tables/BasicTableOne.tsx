import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type TableHeaderItem = {
  key: string;
  title: string;
  className?: string;
};

export type TableRowData = Record<string, React.ReactNode>;

interface BasicTableProps {
  headers: TableHeaderItem[];
  data: TableRowData[];
  minWidth?: string;
  containerClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  cellClassName?: string;
}

export default function BasicTable({
  headers,
  data,
  minWidth = "1102px",
  containerClassName = "",
  headerClassName = "",
  bodyClassName = "",
  cellClassName = "",
}: BasicTableProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] ${containerClassName}`}
    >
      <div className="max-w-full overflow-x-auto">
        <div style={{ minWidth }}>
          <Table>
            {/* Table Header */}
            <TableHeader
              className={`border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-[#0a0a0a] z-10 ${headerClassName}`}
            >
              <TableRow>
                {headers.map((header) => (
                  <TableHead
                    key={header.key}
                    className={`px-5 py-3 font-bold text-black text-sm text-start dark:text-gray-400 ${header.className || ""}`}
                  >
                    {header.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody
              className={`divide-y divide-gray-100 dark:divide-white/[0.05] ${bodyClassName}`}
            >
              {data.map((row, rowIndex) => (
                <TableRow key={`row_${rowIndex}`}>
                  {headers.map((header) => (
                    <TableCell
                      key={`row_${rowIndex}_${header.key}`}
                      className={`px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 ${cellClassName}`}
                    >
                      {row[header.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
