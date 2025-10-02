import { useState, useEffect } from 'react';
import { format, set } from 'date-fns';
import {
  Search,
  Printer,
  EllipsisVertical,
  Calendar,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReceiptModal } from '@/components/pos/ReceiptModal';

interface Transaction {
  id: string;
  transactionId: string;
  date: Date;
  clientName?: string;
  workerId?: string;
  workerName?: string;
  workerCommission?: number;
  workerCommissionAmount?: number;
  cashierName: string;
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
  paymentMethod: string;
  status: 'paid' | 'refunded' | 'voided' | 'pending';
}

export default function InvoicesHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('paid');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [statusData, setStatusData] = useState({
    id: '',
    status: '',
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    // Fetch transactions from the database for the last 30 days
    const fetchTransactions = async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      const data = await window.api.getTransactions({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      console.log(data);
      setTransactions(data);
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.clientName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.cashierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || transaction.status === statusFilter;
    const matchesPayment =
      paymentFilter === 'all' || transaction.paymentMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-success text-success-foreground">
            Completed
          </Badge>
        );
      case 'refunded':
        return <Badge variant="destructive">Refunded</Badge>;
      case 'voided':
        return <Badge variant="secondary">Voided</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleUpdateStatus = async () => {
    
    await window.api
      .updateTransactionStatus({...selectedTransaction, status: statusData.status})
      .then((res) => {
        if (res.success) {
          setTransactions((prev: any) => {
            return prev.map((t: any) => {
              if (t.id === statusData.id) {
                return { ...t, status: statusData.status };
              }
              return t;
            });
          });
          setOpenDialog(false);
          setStatusData({
            id: '',
            status: '',
          });
          setSelectedTransaction({
            startDate: '',
            endDate: '',
          });
        } else {
          alert('Something went wrong!');
        }
      })
      .catch((err) => {
        alert(`Something went wrong: ${err}`);
      });
  };

  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
  };

  const exportTransactions = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export.');
      return;
    }
    const csvData = filteredTransactions.map((t) => ({
      'Transaction ID': t.transactionId,
      Date: format(t.date, 'yyyy-MM-dd HH:mm'),
      Client: t.clientName || 'Walk-in',
      Cashier: t.cashierName,
      Items: t.items.length,
      Subtotal: t.subtotal,
      Discount: t.discountAmount,
      Tax: t.tax,
      Tip: t.tipAmount,
      Total: t.total,
      'Payment Method': t.paymentMethod,
      Status: t.status,
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map((row) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">
            View and manage past transactions and receipts
          </p>
        </div>
        <Button onClick={exportTransactions} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      <Dialog
        open={openDialog}
        onOpenChange={(e) => {
          if (!e) {
            setStatusData({
              id: '',
              status: '',
            });
          }
          setOpenDialog(e);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              {statusData.status === '' ? 'Choose A Status' : 'Confirm?'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex w-full justify-center space-x-10 p-3">
            <Button
              className="w-full"
              variant={statusData.status === '' ? 'outline' : 'destructive'}
              onClick={() => {
                statusData.status === ''
                  ? setStatusData({ ...statusData, status: 'refunded' })
                  : handleUpdateStatus();
              }}
            >
              {statusData.status === '' ? 'Refund' : 'Yes'}
            </Button>
            <Button
              className="w-full"
              variant={statusData.status === '' ? 'outline' : 'active'}
              onClick={() => {
                statusData.status === ''
                  ? setStatusData({ ...statusData, status: 'voided' })
                  : setStatusData({ ...statusData, status: '' });
              }}
            >
              {statusData.status === '' ? 'Void' : 'No'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="voided">Voided</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">
                    {transaction.id}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(transaction.date, 'MMM dd, yyyy')}</div>
                      <div className="text-muted-foreground">
                        {format(transaction.date, 'HH:mm')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.clientName || (
                      <Badge variant="outline">Walk-in</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.workerName ? (
                      <div className="text-sm">
                        <div>{transaction.workerName}</div>
                        <div className="text-muted-foreground text-xs">
                          {transaction.workerCommission}% • $
                          {transaction.workerCommissionAmount?.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">Unassigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>{transaction.cashierName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {transaction.items.length} item
                      {transaction.items.length !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${transaction.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {transaction.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-center">
                      {transaction.status === 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setStatusData({
                              ...statusData,
                              id: transaction.id,
                            });
                            setSelectedTransaction({ ...transaction });
                            setOpenDialog(true);
                          }}
                        >
                          <EllipsisVertical />
                        </Button>
                      )}
                      {transaction.status !== 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewReceipt(transaction)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      {showReceiptModal && selectedTransaction && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          transactionData={{
            transactionId: selectedTransaction.transactionId,
            items: selectedTransaction.items,
            subtotal: selectedTransaction.subtotal,
            discountPercent: selectedTransaction.discountPercent,
            discountAmount: selectedTransaction.discountAmount,
            tax: selectedTransaction.tax,
            tipAmount: selectedTransaction.tipAmount,
            total: selectedTransaction.total,
            paymentMethod: selectedTransaction.paymentMethod,
            cashierName: selectedTransaction.cashierName,
            clientName: selectedTransaction.clientName,
            date: selectedTransaction.date,
          }}
        />
      )}
    </div>
  );
}
