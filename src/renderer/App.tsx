import { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import POSInterface from '@/components/pos/POSInterface';
import Dashboard from '@/components/dashboard/Dashboard';
import AppointmentBooking from '@/components/appoinments/AppointmentBooking';
import InvoicesHistory from '@/components/invoices/InvoicesHistory';
import PendingTransactions from '@/components/pos/PendingTransactions';
import WorkersPerformance from '@/components/workers/WorkersPerformance';
import ClientsManagement from '@/components/clients/ClientsManagement';

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
        return <ClientsManagement/>;
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
