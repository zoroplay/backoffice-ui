export interface Registration {
  username: string;
  fullName: string;
  phoneNumber: string;
  registered: string;
  lastLogin: string;
  balance: number;
  status: "Active" | "Suspended" | "Inactive";
  clientType: "Web" | "Mobile" | "Retail";
}

export const registrations: Registration[] = [
  {
    username: "john_doe",
    fullName: "John Doe",
    phoneNumber: "08012345678",
    registered: "2025-01-12",
    lastLogin: "2025-10-01",
    balance: 12000,
    status: "Active",
    clientType: "Web",
  },
  {
    username: "mary_ade",
    fullName: "Mary Adebayo",
    phoneNumber: "09056781234",
    registered: "2025-02-20",
    lastLogin: "2025-09-22",
    balance: 8000,
    status: "Suspended",
    clientType: "Mobile",
  },
  {
    username: "retail_agent1",
    fullName: "Tunde Onasanya",
    phoneNumber: "07011112222",
    registered: "2025-03-01",
    lastLogin: "2025-08-19",
    balance: 5600,
    status: "Inactive",
    clientType: "Retail",
  },
];
