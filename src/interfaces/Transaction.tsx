export interface Transaction {
  transactionId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    duration: number;
  }>;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  tax: number;
  tipAmount: number;
  total: number;
  clientName?: string;
  workerId?: string;
  workerName?: string;
  workerCommission?: number;
  workerCommissionAmount?: number;
  cashierName: string;
  date: Date;
  notes?: string;
  companyTake?: number;
  status: 'paid' | 'refunded' | 'voided' | 'pending';
}
