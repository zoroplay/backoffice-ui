import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

export type MassBonusPlayer = {
  id: string;
  username: string;
  dateJoined: string;
  email: string;
  phone: string;
  balance: number;
  verified: boolean;
  status: "Active" | "Inactive" | "Suspended";
};

export const columns: ColumnDef<MassBonusPlayer>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "dateJoined",
    header: "Date Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("dateJoined"));
      return date.toLocaleDateString();
    },
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
    header: "Balance",
    cell: ({ row }) => {
      const amount = row.getValue("balance") as number;
      return `₦${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "verified",
    header: "Verified",
    cell: ({ row }) => {
      const verified = row.getValue("verified") as boolean;
      return (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${
            verified
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          {verified ? "Yes" : "No"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors = {
        Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        Suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${
            statusColors[status as keyof typeof statusColors]
          }`}
        >
          {status}
        </span>
      );
    },
  },
];

