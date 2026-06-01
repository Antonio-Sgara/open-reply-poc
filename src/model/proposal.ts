export const proposalStatus = {
  EXECUTED_PARTIALLY: "EXECUTED_PARTIALLY"
};

export interface TransactionStatusGroupI {
  proposalStatus?: string;
  label?: string;
  [key: string]: any;
}

export const productTypes = {
  FUND: "FUND"
};

export enum operativityTypes {
  SUBSCRIPTION = "SUBSCRIPTION",
  REDEMPTION = "REDEMPTION",
  SWITCH = "SWITCH"
}
