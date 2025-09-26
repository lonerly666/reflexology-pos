import { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import POSInterface from '@/components/pos/POSInterface';
import Dashboard from '@/components/dashboard/Dashboard';
import AppointmentBooking from '@/components/appoinments/AppointmentBooking';
import InvoicesHistory from '@/components/invoices/InvoicesHistory';
import PendingTransactions from '@/components/pos/PendingTransactions';
import WorkersPerformance from '@/components/workers/WorkersPerformance';
import { PendingTransaction } from '@/interfaces/PendingTransaction';

// // Mock pending transactions - in real app this would come from backend
// const mockPendingTransactions: PendingTransaction[] = [
//   {
//     transactionId: 'PND-001',
//     items: [
//       {
//         id: '1',
//         name: 'Full Body Reflexology',
//         price: 80,
//         quantity: 1,
//         duration: 60,
//       },
//       {
//         id: '5',
//         name: 'Hot Stone Therapy',
//         price: 65,
//         quantity: 1,
//         duration: 45,
//       },
//     ],
//     subtotal: 145,
//     discountPercent: 0,
//     discountAmount: 0,
//     tax: 14.5,
//     tipAmount: 0,
//     total: 159.5,
//     clientName: 'Sarah Johnson',
//     workerId: '2',
//     workerName: 'Bob Martinez',
//     workerCommission: 50,
//     workerCommissionAmount: 79.75,
//     cashierName: 'John Doe',
//     date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
//     notes: 'Client requested after service payment',
//   },
//   {
//     transactionId: 'PND-002',
//     items: [
//       {
//         id: '2',
//         name: 'Foot Reflexology',
//         price: 45,
//         quantity: 2,
//         duration: 30,
//       },
//     ],
//     subtotal: 90,
//     discountPercent: 10,
//     discountAmount: 9,
//     tax: 8.1,
//     tipAmount: 0,
//     total: 89.1,
//     clientName: 'Mike Chen',
//     workerId: '1',
//     workerName: 'Alice Chen',
//     workerCommission: 45,
//     workerCommissionAmount: 40.1,
//     cashierName: 'Jane Smith',
//     date: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
//     notes: 'Waiting for partner to finish service',
//   },
// ];

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setActiveSection('pos');
  };

  const handleTransactionSaved = () => {
    setEditingTransaction(null);
    setActiveSection('pending');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'pos':
        return (
          <POSInterface
            editingTransaction={editingTransaction}
            onTransactionSaved={handleTransactionSaved}
          />
        );
      case 'dashboard':
        return <Dashboard />;
      case 'appointments':
        return <AppointmentBooking />;
      case 'pending':
        return (
          <PendingTransactions onEditTransaction={handleEditTransaction} />
        );
      case 'workers':
        return <WorkersPerformance />;
      case 'clients':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Client Management</h2>
            <p className="text-muted-foreground">
              Client profiles and history interface would be implemented here.
            </p>
          </div>
        );
      case 'inventory':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
            <p className="text-muted-foreground">
              Product and supply tracking interface would be implemented here.
            </p>
          </div>
        );
      case 'reports':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Sales Reports</h2>
            <p className="text-muted-foreground">
              Analytics and reporting dashboard would be implemented here.
            </p>
          </div>
        );
      case 'invoices':
        return <InvoicesHistory />;
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">System Settings</h2>
            <p className="text-muted-foreground">
              Configuration and preferences interface would be implemented here.
            </p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default Index;
