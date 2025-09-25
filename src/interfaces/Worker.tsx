export interface Worker {
  id: string;
  name: string;
  commission: number;
  status: 'available' | 'busy' | 'break';
}