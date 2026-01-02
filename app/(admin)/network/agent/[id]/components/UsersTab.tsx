"use client";

import React, { useState, useMemo } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import type { SingleValue } from "react-select";
import Select from "react-select";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import { AddUserModal, type AddUserFormValues } from "@/app/(admin)/user-management/users/components/AddUserModal"; 

export type AgentUser = {
  username: string;
  name: string;
  role: string;
  availability: "Available" | "Unavailable";
  email: string;
  phoneNumber: string;
  address: string;
};

const mockAgentUsers: AgentUser[] = [
  {
    username: "user001",
    name: "John Doe",
    role: "Cashier",
    availability: "Available",
    email: "john.doe@example.com",
    phoneNumber: "+234 801 234 5678",
    address: "123 Main Street, Lagos",
  },
  {
    username: "user002",
    name: "Jane Smith",
    role: "Agent",
    availability: "Available",
    email: "jane.smith@example.com",
    phoneNumber: "+234 802 345 6789",
    address: "456 Broad Avenue, Abuja",
  },
  {
    username: "user003",
    name: "Mike Johnson",
    role: "Supervisor",
    availability: "Unavailable",
    email: "mike.johnson@example.com",
    phoneNumber: "+234 803 456 7890",
    address: "789 Park Road, Port Harcourt",
  },
  {
    username: "user004",
    name: "Sarah Williams",
    role: "Cashier",
    availability: "Available",
    email: "sarah.williams@example.com",
    phoneNumber: "+234 804 567 8901",
    address: "321 Market Street, Kano",
  },
  {
    username: "user005",
    name: "David Brown",
    role: "Agent",
    availability: "Available",
    email: "david.brown@example.com",
    phoneNumber: "+234 805 678 9012",
    address: "654 Ocean Drive, Calabar",
  },
  {
    username: "user006",
    name: "Emily Davis",
    role: "Manager",
    availability: "Unavailable",
    email: "emily.davis@example.com",
    phoneNumber: "+234 806 789 0123",
    address: "987 Hill Street, Ibadan",
  },
  {
    username: "user007",
    name: "Chris Wilson",
    role: "Cashier",
    availability: "Available",
    email: "chris.wilson@example.com",
    phoneNumber: "+234 807 890 1234",
    address: "147 River Road, Enugu",
  },
  {
    username: "user008",
    name: "Lisa Anderson",
    role: "Agent",
    availability: "Available",
    email: "lisa.anderson@example.com",
    phoneNumber: "+234 808 901 2345",
    address: "258 Lake Avenue, Benin City",
  },
];

const columns: ColumnDef<AgentUser>[] = [
  { accessorKey: "username", header: "Username" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "availability",
    header: "Availability",
    cell: ({ row }) => {
      const availability = row.getValue<string>("availability");
      return (
        <Badge
          variant="light"
          color={availability === "Available" ? "success" : "error"}
        >
          {availability}
        </Badge>
      );
    },
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phoneNumber", header: "Phone Number" },
  { accessorKey: "address", header: "Address" },
];

type FilterOption = { value: string; label: string };

const filterOptions: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
];

interface UsersTabProps {
  agentId: string;
  agent: Agency;
}

function UsersTab({ agentId, agent }: UsersTabProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<FilterOption>(filterOptions[0]);
  const [users, setUsers] = useState<AgentUser[]>(mockAgentUsers);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Filter users based on selected filter
  const filteredData = useMemo(() => {
    if (filter.value === "all") {
      return users;
    } else {
      return users.filter(
        (user) =>
          user.availability.toLowerCase() === filter.value.toLowerCase()
      );
    }
  }, [users, filter]);

  const handleFilterChange = (option: SingleValue<FilterOption>) => {
    if (option) {
      setFilter(option);
    }
  };

  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleSubmitUser = (formValues: AddUserFormValues) => {
    // Create a new user from form values
    const newUser: AgentUser = {
      username: formValues.username,
      name: `${formValues.name} ${formValues.surname}`.trim(),
      role: formValues.userLevel || "Agent",
      availability: "Available", // Default to available
      email: formValues.email,
      phoneNumber: formValues.phoneNumber,
      address: formValues.address,
    };

    // Add the new user to the list
    setUsers((prevUsers) => [...prevUsers, newUser]);

    // Close the modal
    setIsAddUserModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="w-full sm:w-[250px]">
          <Select<FilterOption>
            styles={reactSelectStyles(theme)}
            options={filterOptions}
            placeholder="All"
            value={filter}
            onChange={handleFilterChange}
          />
        </div>
        <Button 
          variant="primary" 
          size="md" 
          className="bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
          onClick={handleAddUser}
        >
          + Add New User
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span>👥</span>
            Agent Users List
          </h3>          
        </div>
        <div className="p-6">
          <DataTable columns={columns} data={filteredData} />
        </div>
      </div>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseAddUserModal}
        onSubmit={handleSubmitUser}
      />
    </div>
  );
}

export default UsersTab;

