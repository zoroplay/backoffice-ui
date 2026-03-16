export type PaymentMethod = {
  id: string;
  isEnabled: boolean;
  isDefaultWithdrawal: boolean;
  useForWithdrawal: boolean;
  displayTitle: string;
  providerName: string;
  apiSecretKey: string;
  apiPublicKey: string;
  merchantId: string;
  baseUrl: string;
};
