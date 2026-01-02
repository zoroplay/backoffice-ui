export interface SegmentPlayer {
  id: string;
  username: string;
  status: "Active" | "Inactive" | "Frozen";
}

export interface PlayerSegment {
  id: string;
  name: string;
  minOdd: number;
  minSelection: number;
  createdBy: string;
  errorMessage: string;
  players: SegmentPlayer[];
}

export const playerSegments: PlayerSegment[] = [
  {
    id: "seg-1",
    name: "High Rollers",
    minOdd: 2.5,
    minSelection: 3,
    createdBy: "Jane Admin",
    errorMessage: "Selection does not meet the high-roller criteria.",
    players: [
      { id: "p-1", username: "bigspender", status: "Active" },
      { id: "p-2", username: "vip_master", status: "Frozen" },
    ],
  },
  {
    id: "seg-2",
    name: "Newcomers",
    minOdd: 1.8,
    minSelection: 2,
    createdBy: "Support Team",
    errorMessage: "Reach out to support for eligibility.",
    players: [
      { id: "p-3", username: "freshstart", status: "Active" },
      { id: "p-4", username: "rookie123", status: "Inactive" },
      { id: "p-5", username: "firstbet", status: "Active" },
    ],
  },
  {
    id: "seg-3",
    name: "Weekend Warriors",
    minOdd: 2.0,
    minSelection: 4,
    createdBy: "Marketing",
    errorMessage: "Segment locked outside weekend campaigns.",
    players: [],
  },
];

