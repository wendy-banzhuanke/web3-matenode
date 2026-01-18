export {};
declare global {
  interface Window {
    wendyEtherum: {
      request: (args: { 
        method: string; 
        params?: any[] 
      }) => Promise<any>;
      isWendyWallet?: boolean;
      chainId?: string;
      selectedAddress?: string;
    };
  }
}