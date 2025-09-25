export interface PaymentMethod {
  type: 'cash' | 'card' | 'points' | 'mixed';
  amount: number;
}