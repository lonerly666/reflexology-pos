import { useState } from "react";
import { format } from "date-fns";
import { Search, Printer, Eye, Filter, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReceiptModal } from "@/components/pos/ReceiptModal";

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
  status: "completed" | "refunded" | "voided";
}

// Mock transaction data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    transactionId: "TXN-1734567890123",
    date: new Date("2024-12-18T14:30:00"),
    clientName: "Emma Wilson",
    workerId: "1",
    workerName: "Alice Chen",
    workerCommission: 45,
    workerCommissionAmount: 44.1,
    cashierName: "Sarah Johnson",
    items: [
      { id: "1", name: "Full Body Reflexology", price: 80, quantity: 1, duration: 60 }
    ],
    subtotal: 80,
    discountPercent: 0,
    discountAmount: 0,
    tax: 8,
    tipAmount: 10,
    total: 98,
    paymentMethod: "card",
    status: "completed"
  },
  {
    id: "2", 
    transactionId: "TXN-1734567890124",
    date: new Date("2024-12-18T13:45:00"),
    clientName: "Michael Brown",
    workerId: "3",
    workerName: "Carol Kim",
    workerCommission: 40,
    workerCommissionAmount: 39.66,
    cashierName: "Sarah Johnson",
    items: [
      { id: "2", name: "Foot Reflexology", price: 45, quantity: 1, duration: 30 },
      { id: "6", name: "Aromatherapy Session", price: 40, quantity: 1, duration: 30 }
    ],
    subtotal: 85,
    discountPercent: 10,
    discountAmount: 8.5,
    tax: 7.65,
    tipAmount: 15,
    total: 99.15,
    paymentMethod: "cash",
    status: "completed"
  },
  {
    id: "3",
    transactionId: "TXN-1734567890125", 
    date: new Date("2024-12-18T12:15:00"),
    clientName: undefined,
    workerId: "2",
    workerName: "Bob Martinez",
    workerCommission: 50,
    workerCommissionAmount: 33,
    cashierName: "John Doe",
    items: [
      { id: "3", name: "Hand Reflexology", price: 30, quantity: 2, duration: 20 }
    ],
    subtotal: 60,
    discountPercent: 0,
    discountAmount: 0,
    tax: 6,
    tipAmount: 0,
    total: 66,
    paymentMethod: "card",
    status: "completed"
  },
  {
    id: "4",
    transactionId: "TXN-1734567890126",
    date: new Date("2024-12-17T16:20:00"),
    clientName: "Jennifer Davis",
    workerId: "4",
    workerName: "David Park",
    workerCommission: 48,
    workerCommissionAmount: 38.16,
    cashierName: "Sarah Johnson",
    items: [
      { id: "5", name: "Hot Stone Therapy", price: 65, quantity: 1, duration: 45 }
    ],
    subtotal: 65,
    discountPercent: 0,
    discountAmount: 0,
    tax: 6.5,
    tipAmount: 8,
    total: 79.5,
    paymentMethod: "card",
    status: "refunded"
  },
  {
    id: "5",
    transactionId: "TXN-1734567890127",
    date: new Date("2024-12-17T11:00:00"),
    clientName: "David Kim",
    workerId: "5",
    workerName: "Emma Rodriguez",
    workerCommission: 42,
    workerCommissionAmount: 49.64,
    cashierName: "John Doe",
    items: [
      { id: "4", name: "Ear Reflexology", price: 25, quantity: 1, duration: 15 },
      { id: "1", name: "Full Body Reflexology", price: 80, quantity: 1, duration: 60 }
    ],
    subtotal: 105,
    discountPercent: 15,
    discountAmount: 15.75,
    tax: 8.93,
    tipAmount: 20,
    total: 118.18,
    paymentMethod: "cash",
    status: "completed"
  }
];

export default function InvoicesHistory() {
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.cashierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || transaction.paymentMethod === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case "refunded":
        return <Badge variant="destructive">Refunded</Badge>;
      case "voided":
        return <Badge variant="secondary">Voided</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
  };

  const exportTransactions = () => {
    const csvData = filteredTransactions.map(t => ({
      'Transaction ID': t.transactionId,
      'Date': format(t.date, 'yyyy-MM-dd HH:mm:ss'),
      'Client': t.clientName || 'Walk-in',
      'Cashier': t.cashierName,
      'Items': t.items.length,
      'Subtotal': t.subtotal,
      'Discount': t.discountAmount,
      'Tax': t.tax,
      'Tip': t.tipAmount,
      'Total': t.total,
      'Payment Method': t.paymentMethod,
      'Status': t.status
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
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
          <p className="text-muted-foreground">View and manage past transactions and receipts</p>
        </div>
        <Button onClick={exportTransactions} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="voided">Voided</SelectItem>
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
          <CardTitle>
            Recent Transactions ({filteredTransactions.length})
          </CardTitle>
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
                    {transaction.transactionId}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(transaction.date, 'MMM dd, yyyy')}</div>
                      <div className="text-muted-foreground">
                        {format(transaction.date, 'HH:mm:ss')}
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
                          {transaction.workerCommission}% • ${transaction.workerCommissionAmount?.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">Unassigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>{transaction.cashierName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
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
                  <TableCell>
                    {getStatusBadge(transaction.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewReceipt(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewReceipt(transaction)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
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