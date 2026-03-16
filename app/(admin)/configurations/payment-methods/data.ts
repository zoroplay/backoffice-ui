import { PaymentMethod } from "./types";

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "paystack",
    isEnabled: true,
    isDefaultWithdrawal: false,
    useForWithdrawal: true,
    displayTitle: "Online Deposit (Paystack)",
    providerName: "paystack",
    apiSecretKey: "sk_test_10d800623da608dbc... (Mocked)",
    apiPublicKey: "pk_test_18ecbba4694765f... (Mocked)",
    merchantId: "",
    baseUrl: "https://api.paystack.co",
  },
  {
    id: "palmpay",
    isEnabled: false,
    isDefaultWithdrawal: false,
    useForWithdrawal: false,
    displayTitle: "PalmPay",
    providerName: "palmpay",
    apiSecretKey: "",
    apiPublicKey: "",
    merchantId: "",
    baseUrl: "",
  },
  {
    id: "payonus",
    isEnabled: true,
    isDefaultWithdrawal: true,
    useForWithdrawal: true,
    displayTitle: "Payonus",
    providerName: "payonus",
    apiSecretKey: "",
    apiPublicKey: "",
    merchantId: "",
    baseUrl: "",
  }
];
