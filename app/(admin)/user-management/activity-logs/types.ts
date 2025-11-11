export type ActivityLog = {
  id: string;
  username: string;
  action: string;
  ipAddress: string;
  timestamp: string;
  userAgent: string;
  payload: Record<string, unknown>;
  response: Record<string, unknown>;
};

export type ActivityFilters = {
  username: string;
  ipAddress: string;
  dateRange: {
    from: Date;
    to: Date;
  };
};

