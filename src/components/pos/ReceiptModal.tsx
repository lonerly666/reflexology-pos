import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, Mail } from "lucide-react";
import { Receipt } from "./Receipt";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  duration: number;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: {
    transactionId: string;
    items: CartItem[];
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    tax: number;
    tipAmount: number;
    total: number;
    paymentMethod: string;
    cashierName?: string;
    clientName?: string;
    date?: Date;
  };
}

export function ReceiptModal({ isOpen, onClose, transactionData }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (receiptRef.current) {
      const printContent = receiptRef.current.cloneNode(true) as HTMLElement;
      const printWindow = window.open('', '', 'width=400,height=600');
      
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt - ${transactionData.transactionId}</title>
              <style>
                @media print {
                  @page {
                    size: 80mm auto;
                    margin: 0;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.2;
                  }
                  .receipt-container {
                    width: 80mm;
                    padding: 8px;
                    box-sizing: border-box;
                  }
                }
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.2;
                  margin: 0;
                  padding: 8px;
                }
                .receipt-container {
                  width: 80mm;
                  max-width: 384px;
                }
              </style>
            </head>
            <body>
              ${printContent.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  const handleDownload = () => {
    if (receiptRef.current) {
      // Create a blob with the receipt HTML
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${transactionData.transactionId}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 8px;
                width: 80mm;
                max-width: 384px;
              }
            </style>
          </head>
          <body>
            ${receiptRef.current.outerHTML}
          </body>
        </html>
      `;
      
      const blob = new Blob([receiptHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${transactionData.transactionId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Transaction Receipt</DialogTitle>
        </DialogHeader>
        
        <div className="gap-4 h-full">
          {/* Receipt Preview */}
          <div className="flex-1 overflow-auto border rounded-lg p-4 bg-gray-50">
            <Receipt
              ref={receiptRef}
              {...transactionData}
            />
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
            
            <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download HTML
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Receipt
            </Button>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <h4 className="font-medium mb-2">Printer Setup</h4>
              <p className="text-gray-600">
                This receipt is optimized for 80mm thermal printers. 
                Ensure your browser print settings are set to:
              </p>
              <ul className="mt-2 text-xs text-gray-500">
                <li>• Paper size: 80mm</li>
                <li>• No margins</li>
                <li>• No headers/footers</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}