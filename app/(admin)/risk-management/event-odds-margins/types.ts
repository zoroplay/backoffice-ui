"use client";

export type EventStatus = "active" | "inactive";

export type CompetitionSettings = {
  margin: number;
  combinability: string;
  status: "enabled" | "disabled";
  cashOut: "enabled" | "disabled";
};

export type EventItem = {
  id: string;
  eventName: string;
  matchId: string;
  startTime: string;
  highlighted: boolean;
  status: EventStatus;
};

export type Competition = {
  id: string;
  name: string;
  events: EventItem[];
  settings: CompetitionSettings;
};

export type Region = {
  id: string;
  name: string;
  competitions: Competition[];
};

export type SportNode = {
  id: string;
  name: string;
  regions: Region[];
};

export type SportsHierarchy = SportNode[];

