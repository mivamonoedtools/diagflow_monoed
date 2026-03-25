declare module "@paystack/inline-js" {
  type CheckoutOptions = {
    key: string;
    email: string;
    amount: number;
    reference?: string;
    ref?: string;
    onSuccess?: (transaction: Record<string, unknown>) => void;
    onCancel?: () => void;
  };

  export default class PaystackPop {
    newTransaction(options: CheckoutOptions): void;
  }
}
