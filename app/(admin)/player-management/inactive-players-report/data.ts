// src/app/(dashboard)/inactive_players/data.ts

export interface InactivePlayer {
  username: string;
  fullName: string;
  phoneNumber: string;
  lastLogin: string;
  balance: number;
  processStatus: "Pending" | "Completed" | "Failed";
  clientType: "web" | "mobile" | "retail";
}

export const inactivePlayersData: InactivePlayer[] = [
  {
    username: "john_doe",
    fullName: "John Doe",
    phoneNumber: "08012345678",
    lastLogin: "2025-09-12",
    balance: 1200,
    processStatus: "Pending",
    clientType: "web",
  },
  {
    username: "mary_smith",
    fullName: "Mary Smith",
    phoneNumber: "08023456789",
    lastLogin: "2025-08-05",
    balance: 5000,
    processStatus: "Completed",
    clientType: "mobile",
  },
  {
    username: "chika_okoro",
    fullName: "Chika Okoro",
    phoneNumber: "08134567890",
    lastLogin: "2025-07-28",
    balance: 800,
    processStatus: "Failed",
    clientType: "retail",
  },
];
