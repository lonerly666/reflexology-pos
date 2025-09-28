export {};

declare global {
  interface Window {
    api: {
      newTransaction: (data: any) => Promise<any>;
      getTransactions: (startDate: string, endDate: string) => Promise<any[]>;
      updateTransactions: (data: any) => Promise<any>;
      getPendingTransactions: () => Promise<any[]>;
      deletePendingTransaction: (id: string) => Promise<{ changes: number }>;
      getTransactionById: (id: string) => Promise<any | null>;
      updateTransactionStatus: (data: any) => Promise<any>;

      //services
      getServices: () => Promise<any[]>;
      addService: (service: any) => Promise<any>;
      updateService: (service: any) => Promise<any>;
      deleteService: (id: number) => Promise<{ success: boolean }>;

      //members
      addMember: (data: any) => Promise<any>;
      getMembers: () => Promise<any[]>;
      deleteMember: (id: number) => Promise<{ success: boolean }>;
      updateMember: (data: any) => Promise<{ changes: number }>;
      searchMember: (data: any) => Promise<any>;
      // add more APIs here, e.g.
      // getSales: () => Promise<Sale[]>;
      // login: (username: string, password: string) => Promise<User | null>;
    };
  }
}
