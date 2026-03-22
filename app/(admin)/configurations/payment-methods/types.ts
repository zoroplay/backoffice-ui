export type PaymentMethod = {
  id: string | number;
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
