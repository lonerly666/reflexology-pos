export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  membershipLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}