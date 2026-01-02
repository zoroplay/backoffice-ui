import { BettingParameters } from "./data";

type FieldType = "number" | "boolean";

export interface FieldDefinition {
 key: keyof BettingParameters;
 label: string;
 type: FieldType;
 prefix?: string;
 suffix?: string;
 helperText?: string;
 colSpan?: number;
}

export interface FieldGroup {
 title: string;
 description?: string;
 fields: FieldDefinition[];
}

export const fieldGroups: FieldGroup[] = [
 {
   title: "Withdrawal & Payout",
   description: "Manage payout thresholds and core limits.",
   fields: [ 
     {
       key: "minimumWithdrawal",
       label: "Minimum Withdrawal",
       type: "number",
       prefix: "₦",
     },
     {
       key: "maximumWithdrawal",
       label: "Maximum Withdrawal",
       type: "number",
       prefix: "₦",
     },
     {
       key: "minimumAvailableCredit",
       label: "Minimum Available Credit",
       type: "number",
       prefix: "₦",
     },
     {
       key: "maxPayout",
       label: "Max Payout",
       type: "number",
       prefix: "₦",
     },
     {
       key: "maxOddLength",
       label: "Max Odd Length",
       type: "number",
     },
   ],
 },
 {
   title: "Ticket Stake Settings",
   description: "Configure stake thresholds for single and combo tickets.",
   fields: [
     {
       key: "singleStakeMin",
       label: "Single Stake Min",
       type: "number",
       prefix: "₦",
     },
     {
       key: "singleStakeMax",
       label: "Single Stake Max",
       type: "number",
       prefix: "₦",
     },
     {
       key: "combStakeMin",
       label: "Combi Stake Min",
       type: "number",
       prefix: "₦",
     },
     {
       key: "combStakeMax",
       label: "Combi Stake Max",
       type: "number",
       prefix: "₦",
     },
   ],
 },
 {
   title: "Ticket Size Settings",
   description: "Limit ticket size ranges for both standard and live bets.",
   fields: [
     {
       key: "ticketSizeMin",
       label: "Ticket Size Min",
       type: "number",
     },
     {
       key: "ticketSizeMax",
       label: "Ticket Size Max",
       type: "number",
     },
     {
       key: "liveTicketMin",
       label: "Live Ticket Size Min",
       type: "number",
     },
     {
       key: "liveTicketMax",
       label: "Live Ticket Size Max",
       type: "number",
     },
   ],
 },
 {
   title: "Limits & Controls",
   description: "Set operational limits for cancellations and winnings.",
   fields: [
     {
       key: "cancelTicketMinutes",
       label: "Max Time to Cancel Ticket (mins)",
       type: "number",
       suffix: "mins",
     },
     {
       key: "dailyCancelLimit",
       label: "Daily Ticket Cancel Limit",
       type: "number",
     },
     {
       key: "singleTicketMaxWinning",
       label: "Single Ticket Max Winning",
       type: "number",
       prefix: "₦",
     },
     {
       key: "maxDuplicateTickets",
       label: "Max Allowed Duplicate Tickets",
       type: "number",
     },
   ],
 },
 {
   title: "Betting Controls",
   description: "Enable or disable betting options for this channel.",
   fields: [
     {
       key: "acceptPreMatchBets",
       label: "Accept PreMatch Bets",
       type: "boolean",
     },
     {
       key: "acceptLiveBets",
       label: "Accept Live Bets",
       type: "boolean",
     },
     {
       key: "enableCashout",
       label: "Enable Cashout",
       type: "boolean",
     },
     {
       key: "enableCutX",
       label: "Enable Cut (X)",
       type: "boolean",
     },
     {
       key: "enableSystemBet",
       label: "Enable System Bet",
       type: "boolean",
     },
     {
       key: "enableSplitBet",
       label: "Enable Split Bet",
       type: "boolean",
     },
   ],
 },
 {
   title: "Bonus & Hold",
   description: "Adjust bonus qualifying odds and hold periods.",
   fields: [
     {
       key: "minBonusOdds",
       label: "Min Bonus Odds",
       type: "number",
     },
     {
       key: "holdBetsFrom",
       label: "Hold Bets From",
       type: "number",
       prefix: "₦",
     },
   ],
 },
];