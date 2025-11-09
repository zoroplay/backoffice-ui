export type PageTarget = "Web" | "Mobile" | "Hybrid";

export interface ContentPage {
  id: string;
  title: string;
  target: PageTarget;
  createdBy: string;
  content: string;
  isActive: boolean;
  lastUpdated: string;
}

export const contentPages: ContentPage[] = [
  {
    id: "1",
    title: "Test Page",
    target: "Mobile",
    createdBy: "Franklyn Nussie",
    content:
      "Quick preview page for validating copy updates and layout adjustments before production release.",
    isActive: true,
    lastUpdated: "2025-11-06T09:15:00Z",
  },
  {
    id: "2",
    title: "About Us",
    target: "Mobile",
    createdBy: "Isoboye Ibanibo",
    content:
      "Corporate profile detailing our brand promise, market footprint, and compliance statements.",
    isActive: true,
    lastUpdated: "2025-11-05T14:45:00Z",
  },
  {
    id: "3",
    title: "Account Deletion",
    target: "Web",
    createdBy: "Franklyn Nussie",
    content:
      "Step-by-step guide outlining the required verification to close an account permanently.",
    isActive: false,
    lastUpdated: "2025-11-04T17:10:00Z",
  },
  {
    id: "4",
    title: "Terms and Conditions",
    target: "Web",
    createdBy: "Admin",
    content:
      "Master document covering game rules, bonus qualification, and responsible gambling policies.",
    isActive: true,
    lastUpdated: "2025-11-03T10:05:00Z",
  },
  {
    id: "5",
    title: "Privacy Policy",
    target: "Web",
    createdBy: "Ioluwa A.",
    content:
      "Privacy principles describing PII handling, data retention, and regulatory compliance posture.",
    isActive: true,
    lastUpdated: "2025-11-02T08:30:00Z",
  },
];

