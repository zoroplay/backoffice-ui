export type TicketJackpot = {
  id: string;
  displayName: string;
  currency: string;
  lowLimitAmount: number;
  highLimitAmount: number;
  chargeShare: number;
  minShownAmount: number;
  minStakeToWin: number;
  displayPeriod: number;
  drawIntervalStart: string;
  drawIntervalEnd: string;
  allowedGames: string[];
  cashboxAmount: number;
};

