export {};

declare global {
  interface Window {
    api: {
      newTransaction: (data: any) => Promise<any>;
      getTransactions: (startDate: string, endDate: string) => Promise<any[]>;
      updateTransactions: (data: any) => Promise<any>;
      getServices: () => Promise<any[]>;
      getPendingTransactions: () => Promise<any[]>;
      deletePendingTransaction: (id: string) => Promise<{ changes: number }>;
      getTransactionById: (id: string) => Promise<any | null>;
      updateTransactionStatus: (id: string, status: string) => Promise<{ changes: number }>;
      addService: (service: any) => Promise<any>;
      updateService: (service: any) => Promise<any>;
      deleteService: (id: number) => Promise<{ success: boolean }>;
      // add more APIs here, e.g.
      // getSales: () => Promise<Sale[]>;
      // login: (username: string, password: string) => Promise<User | null>;
    };
  }
}
