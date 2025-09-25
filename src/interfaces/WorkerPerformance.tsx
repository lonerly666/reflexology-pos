export interface WorkerPerformance {
  workerId: string;
  workerName: string;
  totalEarnings: number;
  totalTransactions: number;
  averageTransaction: number;
  hoursWorked: number;
  rating: number;
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
    transactions: number;
  }>;
  weeklyEarnings: Array<{
    day: string;
    earnings: number;
    transactions: number;
  }>;
  serviceBreakdown: Array<{
    service: string;
    count: number;
    earnings: number;
  }>;
}