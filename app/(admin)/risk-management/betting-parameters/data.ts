export type ChannelType = "Online" | "Retail";

export type TimeOfDay = "Day" | "Night";

export interface BettingParameters {
  minimumWithdrawal: string;
  maximumWithdrawal: string;
  minimumAvailableCredit?: string;
  maxPayout: string;
  maxOddLength: string;
  singleStakeMin: string;
  singleStakeMax: string;
  combStakeMin: string;
  combStakeMax: string;
  ticketSizeMin: string;
  ticketSizeMax: string;
  liveTicketMin: string;
  liveTicketMax: string;
  cancelTicketMinutes: string;
  dailyCancelLimit: string;
  singleTicketMaxWinning: string;
  maxDuplicateTickets: string;
  acceptPreMatchBets: boolean;
  acceptLiveBets: boolean;
  enableCashout: boolean;
  enableCutX: boolean;
  enableSystemBet: boolean;
  enableSplitBet: boolean;
  minBonusOdds: string;
  holdBetsFrom: string;
}

export type BettingParametersState = Record<
  ChannelType,
  Record<TimeOfDay, BettingParameters>
>;

export const defaultBettingParameters: BettingParametersState = {
  Online: {
    Day: {
      minimumWithdrawal: "100",
      maximumWithdrawal: "1000000",
      maxPayout: "10000000",
      maxOddLength: "1000000",
      singleStakeMin: "100",
      singleStakeMax: "1000000",
      combStakeMin: "100",
      combStakeMax: "1000000",
      ticketSizeMin: "0",
      ticketSizeMax: "50",
      liveTicketMin: "1",
      liveTicketMax: "40",
      cancelTicketMinutes: "300",
      dailyCancelLimit: "300",
      singleTicketMaxWinning: "3000000",
      maxDuplicateTickets: "4",
      acceptPreMatchBets: true,
      acceptLiveBets: true,
      enableCashout: true,
      enableCutX: true,
      enableSystemBet: true,
      enableSplitBet: true,
      minBonusOdds: "1.18",
      holdBetsFrom: "1000",
    },
    Night: {
      minimumWithdrawal: "200",
      maximumWithdrawal: "1500000",
      maxPayout: "12000000",
      maxOddLength: "1200000",
      singleStakeMin: "150",
      singleStakeMax: "1200000",
      combStakeMin: "150",
      combStakeMax: "1200000",
      ticketSizeMin: "0",
      ticketSizeMax: "45",
      liveTicketMin: "1",
      liveTicketMax: "35",
      cancelTicketMinutes: "180",
      dailyCancelLimit: "250",
      singleTicketMaxWinning: "3200000",
      maxDuplicateTickets: "3",
      acceptPreMatchBets: true,
      acceptLiveBets: true,
      enableCashout: true,
      enableCutX: false,
      enableSystemBet: true,
      enableSplitBet: false,
      minBonusOdds: "1.25",
      holdBetsFrom: "1200",
    },
  },
  Retail: {
    Day: {
      minimumWithdrawal: "1000",
      maximumWithdrawal: "1000000",
      minimumAvailableCredit: "25000",
      maxPayout: "10000000",
      maxOddLength: "1000000",
      singleStakeMin: "100",
      singleStakeMax: "1000000",
      combStakeMin: "100",
      combStakeMax: "1000000",
      ticketSizeMin: "0",
      ticketSizeMax: "50",
      liveTicketMin: "1",
      liveTicketMax: "40",
      cancelTicketMinutes: "300",
      dailyCancelLimit: "300",
      singleTicketMaxWinning: "3000000",
      maxDuplicateTickets: "4",
      acceptPreMatchBets: true,
      acceptLiveBets: true,
      enableCashout: true,
      enableCutX: true,
      enableSystemBet: true,
      enableSplitBet: true,
      minBonusOdds: "1.18",
      holdBetsFrom: "1000",
    },
    Night: {
      minimumWithdrawal: "1500",
      maximumWithdrawal: "1200000",
      minimumAvailableCredit: "30000",
      maxPayout: "12000000",
      maxOddLength: "1200000",
      singleStakeMin: "150",
      singleStakeMax: "1200000",
      combStakeMin: "150",
      combStakeMax: "1200000",
      ticketSizeMin: "0",
      ticketSizeMax: "45",
      liveTicketMin: "1",
      liveTicketMax: "35",
      cancelTicketMinutes: "240",
      dailyCancelLimit: "280",
      singleTicketMaxWinning: "3200000",
      maxDuplicateTickets: "3",
      acceptPreMatchBets: true,
      acceptLiveBets: true,
      enableCashout: true,
      enableCutX: false,
      enableSystemBet: true,
      enableSplitBet: false,
      minBonusOdds: "1.2",
      holdBetsFrom: "1500",
    },
  },
};

