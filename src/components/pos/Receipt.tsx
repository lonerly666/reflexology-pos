import { forwardRef } from "react";
import { format } from "date-fns";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  duration: number;
}

interface PaymentMethod {
  type: 'cash' | 'card' | 'points';
  amount: number;
}

interface ReceiptProps {
  transactionId: string;
  items: CartItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  tax: number;
  tipAmount: number;
  total: number;
  paymentMethod: string;
  paymentMethods?: PaymentMethod[];
  memberName?: string;
  workerName?: string;
  workerCommission?: number;
  workerCommissionAmount?: number;
  cashierName?: string;
  clientName?: string;
  date?: Date;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({
  transactionId,
  items,
  subtotal,
  discountPercent,
  discountAmount,
  tax,
  tipAmount,
  total,
  paymentMethod,
  paymentMethods,
  memberName,
  workerName,
  workerCommission,
  workerCommissionAmount,
  cashierName = "System",
  clientName,
  date = new Date()
}, ref) => {
  const formatLine = (left: string, right: string, width = 32) => {
    const rightStr = right.toString();
    const leftStr = left.toString();
    const dotsNeeded = Math.max(0, width - leftStr.length - rightStr.length);
    return leftStr + '.'.repeat(dotsNeeded) + rightStr;
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div 
      ref={ref}
      className="receipt-container bg-white text-black p-4 max-w-[384px] mx-auto font-mono text-sm leading-tight"
      style={{
        width: '80mm',
        minHeight: 'auto',
        fontFamily: 'Courier New, monospace',
        fontSize: '12px',
      }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-lg font-bold mb-1">SERENITY REFLEXOLOGY</div>
        <div className="text-xs">123 Wellness Ave, Spa City, SC 12345</div>
        <div className="text-xs">Phone: (555) 123-4567</div>
        <div className="text-xs">Email: info@serenityreflex.com</div>
        <div className="border-t border-dashed border-gray-400 my-2"></div>
      </div>

      {/* Transaction Info */}
      <div className="mb-3 text-xs">
        <div>Receipt #: {transactionId}</div>
        <div>Date: {format(date, 'MM/dd/yyyy HH:mm:ss')}</div>
        <div>Cashier: {cashierName}</div>
        {clientName && <div>Client: {clientName}</div>}
        <div className="border-t border-dashed border-gray-400 my-2"></div>
      </div>

      {/* Items */}
      <div className="mb-3">
        {items.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="font-semibold">{item.name}</div>
            <div className="text-xs text-gray-600 mb-1">Duration: {item.duration} mins</div>
            <div className="flex justify-between">
              <span>{item.quantity} x {formatCurrency(item.price)}</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          </div>
        ))}
        <div className="border-t border-dashed border-gray-400 my-2"></div>
      </div>

      {/* Totals */}
      <div className="mb-3 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        {discountPercent > 0 && (
          <div className="flex justify-between">
            <span>Discount ({discountPercent}%):</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>Tax (10%):</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        
        {tipAmount > 0 && (
          <div className="flex justify-between">
            <span>Tip:</span>
            <span>{formatCurrency(tipAmount)}</span>
          </div>
        )}
        
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        <div className="flex justify-between font-bold text-base">
          <span>TOTAL:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-4">
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        {workerName && (
          <div className="flex justify-between mb-1">
            <span>Worker:</span>
            <span className="font-semibold">{workerName}</span>
          </div>
        )}
        {workerCommission && workerCommissionAmount && (
          <div className="flex justify-between mb-1 text-xs">
            <span>Commission ({workerCommission}%):</span>
            <span>{formatCurrency(workerCommissionAmount)}</span>
          </div>
        )}
        
        {memberName && (
          <div className="flex justify-between mb-1">
            <span>Member:</span>
            <span className="font-semibold">{memberName}</span>
          </div>
        )}
        
        {paymentMethods && paymentMethods.length > 1 ? (
          <div>
            <div className="font-semibold mb-1">Payment Methods:</div>
            {paymentMethods.map((payment, index) => (
              <div key={index} className="flex justify-between text-xs mb-1">
                <span>
                  {payment.type === 'points' ? '★ Points' : 
                   payment.type === 'cash' ? '💵 Cash' : '💳 Card'}
                </span>
                <span>
                  {payment.type === 'points' 
                    ? `${Math.floor(payment.amount * 100)} pts (${formatCurrency(payment.amount)})`
                    : formatCurrency(payment.amount)
                  }
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-semibold">
                {paymentMethod === 'points' ? '★ MEMBER POINTS' : paymentMethod.toUpperCase()}
              </span>
            </div>
            {paymentMethod === 'points' && (
              <div className="flex justify-between text-xs">
                <span>Points Used:</span>
                <span>{Math.floor(total * 100)} pts</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-between mt-1">
          <span>Amount Paid:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs mt-4">
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        <div className="mb-2">Thank you for visiting!</div>
        <div className="mb-1">Follow us on social media:</div>
        <div className="mb-1">@serenityreflexology</div>
        <div className="mb-2">Visit again soon!</div>
        <div className="text-xs text-gray-500">
          This receipt was printed on {format(new Date(), 'MM/dd/yyyy HH:mm:ss')}
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = "Receipt";