import { PendingRequest } from "./columns";

const today = new Date();

const createDate = (offsetDays: number) => {
  const date = new Date(today);
  date.setDate(today.getDate() - offsetDays);
  return date.toISOString().split("T")[0];
};

export const pendingRequests: PendingRequest[] = [
  {
    id: "1",
    username: "newagent001",
    name: "John Doe",
    requestType: "Agent Registration",
    requestedDate: createDate(1),
    status: "pending",
    agentType: "Agent",
    parentUser: "SPA-NG-1001",
    notes: "New agent registration request",
  },
  {
    id: "2",
    username: "shop-lagos-20",
    name: "Mary Johnson",
    requestType: "Shop Registration",
    requestedDate: createDate(2),
    status: "pending",
    agentType: "Shop",
    parentUser: "master-ng-001",
    notes: "New shop registration",
  },
  {
    id: "3",
    username: "cashier-789012-5",
    name: "Peter Smith",
    requestType: "Cashier Registration",
    requestedDate: createDate(3),
    status: "pending",
    agentType: "Cashier",
    parentUser: "shop-lagos-12",
    notes: "Cashier account request",
  },
  {
    id: "4",
    username: "superagent-new",
    name: "Sarah Williams",
    requestType: "Super Agent Registration",
    requestedDate: createDate(4),
    status: "pending",
    agentType: "Super Agent",
    parentUser: "master-ng-001",
    notes: "Super agent upgrade request",
  },
  {
    id: "5",
    username: "agent-lagos-02",
    name: "Michael Brown",
    requestType: "Agent Registration",
    requestedDate: createDate(5),
    status: "pending",
    agentType: "Agent",
    parentUser: "SPA-NG-2001",
    notes: "Agent registration pending review",
  },
  {
    id: "6",
    username: "webaffiliate-002",
    name: "Emily Davis",
    requestType: "Web Affiliate Registration",
    requestedDate: createDate(6),
    status: "pending",
    agentType: "Web Affiliate",
    parentUser: "master-ng-001",
    notes: "Web affiliate registration",
  },
  {
    id: "7",
    username: "pos-kano-10",
    name: "David Wilson",
    requestType: "POS Registration",
    requestedDate: createDate(7),
    status: "pending",
    agentType: "POS",
    parentUser: "shop-ikeja-07",
    notes: "POS terminal registration",
  },
  {
    id: "8",
    username: "agent-upgrade-01",
    name: "Lisa Anderson",
    requestType: "Account Upgrade",
    requestedDate: createDate(1),
    status: "pending",
    agentType: "Agent",
    parentUser: "SPA-NG-1001",
    notes: "Requesting upgrade to Super Agent",
  },
  {
    id: "9",
    username: "newagent002",
    name: "Robert Taylor",
    requestType: "Agent Registration",
    requestedDate: createDate(8),
    status: "pending",
    agentType: "Agent",
    parentUser: "agent-lagos-01",
    notes: "New agent registration",
  },
  {
    id: "10",
    username: "cashier-345678-2",
    name: "Jennifer Martinez",
    requestType: "Cashier Registration",
    requestedDate: createDate(9),
    status: "pending",
    agentType: "Cashier",
    parentUser: "shop-lagos-12",
    notes: "Additional cashier account",
  },
  {
    id: "11",
    username: "approved-agent",
    name: "Thomas Garcia",
    requestType: "Agent Registration",
    requestedDate: createDate(15),
    status: "approved",
    agentType: "Agent",
    parentUser: "SPA-NG-2001",
    notes: "Approved registration",
  },
  {
    id: "12",
    username: "rejected-shop",
    name: "Patricia Rodriguez",
    requestType: "Shop Registration",
    requestedDate: createDate(20),
    status: "rejected",
    agentType: "Shop",
    parentUser: "master-ng-001",
    notes: "Rejected - incomplete documentation",
  },
];

export type FilterOption = {
  value: string;
  label: string;
};

export const filterOptions: Array<{
  label: string;
  options: FilterOption[];
}> = [
  {
    label: "Request Type",
    options: [
      { value: "Agent Registration", label: "Agent Registration" },
      { value: "Shop Registration", label: "Shop Registration" },
      { value: "Cashier Registration", label: "Cashier Registration" },
      { value: "Super Agent Registration", label: "Super Agent Registration" },
      { value: "Web Affiliate Registration", label: "Web Affiliate Registration" },
      { value: "POS Registration", label: "POS Registration" },
      { value: "Account Upgrade", label: "Account Upgrade" },
    ],
  },
  {
    label: "Status",
    options: [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
  },
];

