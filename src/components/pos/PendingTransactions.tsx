import { useState } from 'react';
import { Edit, Trash2, CreditCard, Banknote, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PendingTransaction } from '@/interfaces/PendingTransaction';

interface PendingTransactionsProps {
  onEditTransaction: (transaction: PendingTransaction) => void;
  pendingTransactionData?: PendingTransaction[];
  setPendingTransactionData?: React.Dispatch<
    React.SetStateAction<PendingTransaction[]>
  >;
}

export default function PendingTransactions({
  onEditTransaction,
  pendingTransactionData,
  setPendingTransactionData,
}: PendingTransactionsProps) {
  const deletePendingTransaction = (transactionId: string) => {
    if (setPendingTransactionData) {
      setPendingTransactionData(
        (prev: PendingTransaction[]) =>
          prev?.filter((t) => t.transactionId !== transactionId) || [],
      );
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Pending Transactions</h2>
        <Badge variant="secondary" className="text-sm">
          <Clock className="h-4 w-4 mr-2" />
          {pendingTransactionData?.length} Pending
        </Badge>
      </div>

      {pendingTransactionData?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              No Pending Transactions
            </h3>
            <p className="text-muted-foreground">
              All transactions have been completed or there are no pending
              orders.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingTransactionData?.map((transaction) => (
            <Card
              key={transaction.transactionId}
              className="border-l-4 border-l-yellow-500"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {transaction.transactionId}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {transaction.clientName && `${transaction.clientName} • `}
                      {transaction.workerName &&
                        `Worker: ${transaction.workerName} • `}
                      {formatTimeAgo(transaction.date)} •{' '}
                      {transaction.cashierName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ${transaction.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.items.reduce(
                        (acc, item) => acc + item.duration * item.quantity,
                        0,
                      )}{' '}
                      min total
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2">
                  {transaction.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2"
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(item.duration)} • $
                          {item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${transaction.subtotal.toFixed(2)}</span>
                  </div>
                  {transaction.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({transaction.discountPercent}%):</span>
                      <span>-${transaction.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${transaction.tax.toFixed(2)}</span>
                  </div>
                  {transaction.tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tip:</span>
                      <span>${transaction.tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Company's Cut:</span>
                    <span>${transaction.companyTake?.toFixed(2)}</span>
                  </div>
                </div>

                {transaction.workerName && (
                  <>
                    <Separator />
                    <div className="bg-primary/5 p-3 rounded-md">
                      <div className="flex justify-between items-center text-sm">
                        <span>
                          <strong>Assigned Worker:</strong>{' '}
                          {transaction.workerName}
                        </span>
                        <span className="text-muted-foreground">
                          Commission: {transaction.workerCommission}%
                        </span>
                      </div>
                      {transaction.workerCommissionAmount && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Estimated earnings: $
                          {transaction.workerCommissionAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {transaction.notes && (
                  <>
                    <Separator />
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">
                        <strong>Notes:</strong> {transaction.notes}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditTransaction(transaction)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit/Complete Order
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      deletePendingTransaction(transaction.transactionId)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
