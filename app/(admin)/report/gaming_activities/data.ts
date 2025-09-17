export interface TableDataTypes {
  group: number
  bets: number
  turnover: number
  winnings: number
  ggr: number
  margin: string
}

// Mock data (can be replaced with API fetch later)
export const tableData: TableDataTypes[] = [
  { group: 1, bets: 0.0, turnover: 0.0, winnings: 0.0, ggr: 0.0, margin: "3.9K" },
  { group: 2, bets: 0.0, turnover: 0.0, winnings: 0.0, ggr: 0.0, margin: "3.9K" },
  { group: 3, bets: 0.0, turnover: 0.0, winnings: 0.0, ggr: 0.0, margin: "3.9K" },
  { group: 4, bets: 0.0, turnover: 0.0, winnings: 0.0, ggr: 0.0, margin: "3.9K" },
  { group: 5, bets: 0.0, turnover: 0.0, winnings: 0.0, ggr: 0.0, margin: "3.9K" },
]
