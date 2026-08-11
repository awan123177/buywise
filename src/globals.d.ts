declare global {
  interface Window {
    AndroidBillingBridge?: {
      startPurchase: (productId: string, couponCode?: string) => void;
      restorePurchases: () => void;
    };
  }
}
export {};
