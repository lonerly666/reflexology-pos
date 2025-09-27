import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Calculator,
  CreditCard,
  Banknote,
  Clock,
  User,
  Star,
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { PaymentMethod } from '@/interfaces/PaymentMethod';
import { Service } from '@/interfaces/Service';
import { Member } from '@/interfaces/Member';
import { Worker } from '@/interfaces/Worker';

interface CartItem extends Service {
  quantity: number;
  discount?: number;
}

interface POSInterfaceProps {
  editingTransaction?: any;
  onTransactionSaved?: (data: any) => void;
}

const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@email.com',
    phone: '555-0101',
    points: 1250,
    membershipLevel: 'Gold',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@email.com',
    phone: '555-0102',
    points: 580,
    membershipLevel: 'Silver',
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@email.com',
    phone: '555-0103',
    points: 2100,
    membershipLevel: 'Platinum',
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@email.com',
    phone: '555-0104',
    points: 320,
    membershipLevel: 'Bronze',
  },
  {
    id: '5',
    name: 'Emma Brown',
    email: 'emma@email.com',
    phone: '555-0105',
    points: 890,
    membershipLevel: 'Silver',
  },
];

const MOCK_WORKERS: Worker[] = [
  {
    id: '1',
    name: 'Alice Chen',
    commission: 45,
    status: 'available',
  },
  {
    id: '2',
    name: 'Bob Martinez',
    commission: 50,
    status: 'available',
  },
  {
    id: '3',
    name: 'Carol Kim',
    commission: 40,
    status: 'busy',
  },
  {
    id: '4',
    name: 'David Park',
    commission: 48,
    status: 'available',
  },
  {
    id: '5',
    name: 'Emma Rodriguez',
    commission: 42,
    status: 'break',
  },
];

export default function POSInterface({
  editingTransaction,
  onTransactionSaved,
}: POSInterfaceProps = {}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tipAmount, setTipAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>(
    'percent',
  );
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showMixedPayment, setShowMixedPayment] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [workerSearchTerm, setWorkerSearchTerm] = useState('');
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    //get all available services from DB
    window.api
      .getServices()
      .then((services: Service[]) => {
        setServices(services);
      })
      .catch((err: any) => {
        console.error('Error loading services from DB:', err);
      });
  }, []);

  const categories = [
    'all',
    ...Array.from(new Set(services.map((s) => s.category))),
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredMembers = MOCK_MEMBERS.filter(
    (member) =>
      member.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
      member.phone.includes(memberSearchTerm) ||
      member.email.toLowerCase().includes(memberSearchTerm.toLowerCase()),
  );

  const filteredWorkers = MOCK_WORKERS.filter((worker) =>
    worker.name.toLowerCase().includes(workerSearchTerm.toLowerCase()),
  );

  const addToCart = (service: Service) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...service, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const AMOUNT_PER_SERVICE = 8; //amount of money taken by company per service
  let subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  let serviceCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  let finalDiscountAmount =
    discountType === 'percent'
      ? subtotal * (discountPercent / 100)
      : Math.min(discountAmount, subtotal);
  let afterDiscount = subtotal - finalDiscountAmount;
  let tax = afterDiscount * 0.1; // 10% tax
  let total = afterDiscount + tax + tipAmount;

  let pointsValue = 1; // $1 per point
  let maxPointsUsable = selectedMember
    ? Math.min(selectedMember.points, Math.floor(total * 100))
    : 0;
  let totalPaymentMethods = paymentMethods.reduce(
    (sum, method) => sum + method.amount,
    0,
  );
  let remainingBalance = total - totalPaymentMethods;

  // Load editing transaction if provided
  useEffect(() => {
    if (editingTransaction) {
      const cartItems: CartItem[] = editingTransaction.items.map((item:any) => ({
        ...item,
        category: services.find((s) => s.id === item.id)?.category || 'Other',
        quantity: item.quantity,
      }));
      setCart(cartItems);
      setTipAmount(editingTransaction.tipAmount);
      setDiscountPercent(editingTransaction.discountPercent);
      setClientName(editingTransaction.clientName || '');
      setSelectedWorker(
        MOCK_WORKERS.find((w) => w.id === editingTransaction.workerId) || null,
      );
      setNotes(editingTransaction.notes || '');
    }
  }, [editingTransaction]);

  const clearCart = () => {
    setCart([]);
    setTipAmount(0);
    setDiscountPercent(0);
    setDiscountAmount(0);
    setDiscountType('percent');
    setClientName('');
    setNotes('');
    setSelectedMember(null);
    setMemberSearchTerm('');
    setPaymentMethods([]);
    setShowMixedPayment(false);
    setSelectedWorker(null);
    setWorkerSearchTerm('');
  };

  const savePendingTransaction = () => {
    const transactionId =
      editingTransaction? editingTransaction.id : `TXN-${Date.now()}`; //TODO: id needs to be updated later to match requirement
    const companyCut = serviceCount * AMOUNT_PER_SERVICE;
    const pendingTransaction = {
      id: transactionId,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        duration: item.duration,
      })),
      subtotal,
      discountPercent,
      discountAmount: finalDiscountAmount,
      tax,
      tipAmount,
      total,
      clientId: selectedMember?.id || null,
      clientName: clientName || null,
      companyTake: companyCut,
      status: 'pending',
      cashierName: 'John Doe', // This would come from auth context
      date: editingTransaction?.date || new Date().toISOString(),
      notes: notes || null,
      workerId: selectedWorker?.id,
      workerName: selectedWorker?.name,
      workerCommission: selectedWorker?.commission,
      workerCommissionAmount: selectedWorker
        ? total * (selectedWorker.commission / 100) - companyCut
        : 0,
      paymentMethod: '',
    };

    editingTransaction
      ? updatedTransactionInDB(pendingTransaction)
      : writeTransactionToDB(pendingTransaction);
    onTransactionSaved?.(pendingTransaction);
    clearCart();
  };

  const writeTransactionToDB = async (data: any) => {
    console.log('Saving transaction to DB:', data);
    await window.api
      .newTransaction(data)
      .then((res: any) => {
        console.log('Transaction saved to DB:', res);
      })
      .catch((err: any) => {
        console.error('Error saving transaction to DB:', err);
      });
  };

  const updatedTransactionInDB = async (data: any) => {
    console.log('Updating transaction in DB:', data);
    await window.api
      .updateTransactions(data)
      .then((res: any) => {
        console.log('Transaction updated in DB:', res);
        onTransactionSaved?.(data);
      })
      .catch((err: any) => {
        console.error('Error updating transaction in DB:', err);
      });
  };

  const completeTransaction = (
    paymentMethod: 'cash' | 'card' | 'points' | 'mixed',
  ) => {
  
    const transactionId = editingTransaction
      ? editingTransaction.id
      : `TXN-${Date.now()}`; //TODO: id needs to be updated later to match requirement

    let finalPaymentMethods = paymentMethods;
    if (paymentMethod !== 'mixed') {
      if (paymentMethod === 'points') {
        const pointsNeeded = total;
        finalPaymentMethods = [{ type: 'points', amount: total }];
        // Deduct points from member (in real app, this would update the database)
        if (selectedMember) {
          selectedMember.points -= pointsNeeded;
        }
      } else {
        finalPaymentMethods = [{ type: paymentMethod, amount: total }];
      }
    } else {
      // For mixed payments, deduct points if used
      const pointsPayment = paymentMethods.find((p) => p.type === 'points');
      if (pointsPayment && selectedMember) {
        const pointsUsed = Math.floor(pointsPayment.amount * 100);
        selectedMember.points -= pointsUsed;
      }
    }

    // Calculate worker commission
    let serviceCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    let companyCut = serviceCount * AMOUNT_PER_SERVICE;
    const workerCommission = selectedWorker
      ? total * (selectedWorker.commission / 100)
      : 0 - companyCut;

    const transactionData = {
      id: transactionId,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        duration: item.duration,
      })),
      subtotal,
      discountPercent,
      discountAmount: finalDiscountAmount,
      tax,
      tipAmount,
      total,
      paymentMethod,
      paymentMethods: finalPaymentMethods,
      clientId: selectedMember?.id || null,
      memberName: selectedMember?.name || null,
      workerId: selectedWorker?.id,
      workerName: selectedWorker?.name,
      workerCommission: selectedWorker?.commission,
      workerCommissionAmount: workerCommission,
      cashierName: 'John Doe', // This would come from auth context
      clientName: clientName || null,
      date: new Date().toISOString(),
      companyTake: companyCut,
      status: 'paid',
    };
    editingTransaction
      ? updatedTransactionInDB(transactionData)
      : writeTransactionToDB(transactionData);
    setLastTransaction(transactionData);
    setShowReceiptModal(true);
    clearCart();
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      {/* Services Panel */}
      <div className="col-span-7">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search services..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3 overflow-auto max-h-[calc(100vh-16rem)]">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                  onClick={() => addToCart(service)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm leading-tight">
                        {service.name}
                      </h3>
                      <Badge variant="secondary" className="ml-2">
                        {service.duration}min
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">
                        ${service.price}
                      </span>
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart & Checkout Panel */}
      <div className="col-span-5">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Current Transaction</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearCart}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* Cart Items */}
            <div className="flex-1 overflow-auto mb-4">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p>No items in cart</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 bg-secondary/50 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${item.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations */}
            {cart.length > 0 && (
              <>
                <Separator className="my-4" />

                {/* Discount & Tip */}
                <div className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <div className="flex flex-1">
                      <Input
                        type="number"
                        placeholder={
                          discountType === 'percent'
                            ? 'Discount %'
                            : 'Discount $'
                        }
                        value={
                          discountType === 'percent'
                            ? discountPercent || ''
                            : discountAmount || ''
                        }
                        onChange={(e) => {
                          const value = Number(e.target.value) || 0;
                          if (discountType === 'percent') {
                            setDiscountPercent(value);
                          } else {
                            setDiscountAmount(value);
                          }
                        }}
                        className="rounded-r-none"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-l-none border-l-0 px-3"
                        onClick={() => {
                          setDiscountType(
                            discountType === 'percent' ? 'amount' : 'percent',
                          );
                          setDiscountPercent(0);
                          setDiscountAmount(0);
                        }}
                      >
                        {discountType === 'percent' ? '%' : '$'}
                      </Button>
                    </div>
                    <Input
                      type="number"
                      placeholder="Tip $"
                      value={tipAmount || ''}
                      onChange={(e) =>
                        setTipAmount(Number(e.target.value) || 0)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>RM {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Company's Take: </span>
                    <span>
                      RM {(serviceCount * AMOUNT_PER_SERVICE).toFixed(2)}
                    </span>
                  </div>
                  {(discountPercent > 0 || discountAmount > 0) && (
                    <div className="flex justify-between text-destructive">
                      <span>
                        Discount{' '}
                        {discountType === 'percent'
                          ? `(${discountPercent}%)`
                          : ''}
                        :
                      </span>
                      <span>-RM {finalDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>RM {tax.toFixed(2)}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tip:</span>
                      <span>RM {tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">RM {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Buttons */}
                {!showMixedPayment ? (
                  <div className="space-y-2 mt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={
                          paymentMethods.length > 0 &&
                          paymentMethods[0].type === 'cash'
                            ? 'active'
                            : 'outline'
                        }
                        className={`h-12`}
                        onClick={() => {
                          setPaymentMethods([]);
                          setPaymentMethods((prev) => {
                            return [...prev, { type: 'cash', amount: total }];
                          });
                        }}
                      >
                        <Banknote className="h-4 w-4 mr-2" />
                        Cash
                      </Button>
                      <Button
                        variant={
                          paymentMethods.length > 0 &&
                          paymentMethods[0].type === 'card'
                            ? 'active'
                            : 'outline'
                        }
                        className={`h-12`}
                        onClick={() => {
                          setPaymentMethods([]);
                          setPaymentMethods((prev) => {
                            return [...prev, { type: 'card', amount: total }];
                          });
                        }}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Card
                      </Button>
                    </div>
                    {selectedMember && (
                      <Button
                        variant={
                          paymentMethods.length > 0 &&
                          paymentMethods[0].type === 'points'
                            ? 'active'
                            : 'outline'
                        }
                        className="h-12 w-full"
                        onClick={() => {
                          setPaymentMethods([]);
                          setPaymentMethods((prev) => {
                            return [...prev, { type: 'points', amount: total }];
                          });
                        }}
                        disabled={maxPointsUsable < total}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Pay with Points {total} pts needed
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className={`h-10 w-full `}
                      onClick={() => setShowMixedPayment(true)}
                    >
                      Mixed Payment Options
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Mixed Payment</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowMixedPayment(false);
                          setPaymentMethods([]);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-2">
                      {paymentMethods.map((method, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-secondary/50 rounded"
                        >
                          <span className="capitalize text-sm font-medium min-w-0">
                            {method.type === 'points' ? (
                              <>
                                <Star className="inline h-3 w-3 mr-1" />
                                Points
                              </>
                            ) : method.type === 'cash' ? (
                              <>
                                <Banknote className="inline h-3 w-3 mr-1" />
                                Cash
                              </>
                            ) : (
                              <>
                                <CreditCard className="inline h-3 w-3 mr-1" />
                                Card
                              </>
                            )}
                          </span>
                          <span className="text-sm">
                            ${method.amount.toFixed(2)}
                          </span>
                          {method.type === 'points' && (
                            <span className="text-xs text-muted-foreground">
                              {method.amount} pts
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setPaymentMethods((prev) =>
                                prev.filter((_, i) => i !== index),
                              );
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Add Payment Method with Manual Amount Input */}
                    {remainingBalance > 0 && (
                      <div className="space-y-3">
                        {/* Cash Payment */}
                        <div className="flex gap-2 items-center">
                          <div className="flex items-center gap-2 flex-1">
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium w-12">
                              Cash
                            </span>
                            <Input
                              type="number"
                              placeholder="$0.00"
                              step="0.01"
                              min="0"
                              max={remainingBalance}
                              className="flex-1"
                              onChange={(e) => {
                                const amount = Number(e.target.value) || 0;

                                if (amount > 0) {
                                  const currCash =
                                    paymentMethods.find(
                                      (p) => p.type === 'cash',
                                    )?.amount || 0;
                                  const maxAllowed =
                                    remainingBalance + currCash;
                                  const finalAmount = Math.min(
                                    amount,
                                    maxAllowed,
                                  );
                                  setPaymentMethods((prev) => {
                                    const filtered = prev.filter(
                                      (p) => p.type !== 'cash',
                                    );
                                    return [
                                      ...filtered,
                                      { type: 'cash', amount: finalAmount },
                                    ];
                                  });
                                } else {
                                  setPaymentMethods((prev) =>
                                    prev.filter((p) => p.type !== 'cash'),
                                  );
                                }
                              }}
                              value={
                                paymentMethods.find((p) => p.type === 'cash')
                                  ?.amount || ''
                              }
                            />
                          </div>
                        </div>

                        {/* Card Payment */}
                        <div className="flex gap-2 items-center">
                          <div className="flex items-center gap-2 flex-1">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium w-12">
                              Card
                            </span>
                            <Input
                              type="number"
                              placeholder="$0.00"
                              step="0.01"
                              min="0"
                              max={remainingBalance}
                              className="flex-1"
                              onChange={(e) => {
                                const amount = Number(e.target.value) || 0;
                                if (amount > 0) {
                                  const currCard =
                                    paymentMethods.find(
                                      (p) => p.type === 'card',
                                    )?.amount || 0;
                                  const maxAllowed =
                                    remainingBalance + currCard;
                                  const finalAmount = Math.min(
                                    amount,
                                    maxAllowed,
                                  );
                                  setPaymentMethods((prev) => {
                                    const filtered = prev.filter(
                                      (p) => p.type !== 'card',
                                    );
                                    return [
                                      ...filtered,
                                      { type: 'card', amount: finalAmount },
                                    ];
                                  });
                                } else {
                                  setPaymentMethods((prev) =>
                                    prev.filter((p) => p.type !== 'card'),
                                  );
                                }
                              }}
                              value={
                                paymentMethods.find((p) => p.type === 'card')
                                  ?.amount || ''
                              }
                            />
                          </div>
                        </div>

                        {/* Points Payment - Only if member selected */}
                        {selectedMember && maxPointsUsable > 0 && (
                          <div className="flex gap-2 items-center">
                            <div className="flex items-center gap-2 flex-1">
                              <Star className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium w-12">
                                Points
                              </span>
                              <Input
                                type="number"
                                placeholder="$0.00"
                                step="0.01"
                                min="0"
                                max={Math.min(
                                  remainingBalance,
                                  selectedMember.points * pointsValue,
                                )}
                                className="flex-1"
                                onChange={(e) => {
                                  let amount = Number(e.target.value) || 0;
                                  if (amount > 0) {
                                    amount =
                                      amount >
                                      selectedMember.points * pointsValue
                                        ? selectedMember.points * pointsValue
                                        : amount;
                                    const currPoints =
                                      paymentMethods.find(
                                        (p) => p.type === 'points',
                                      )?.amount || 0;
                                    const maxAllowed =
                                      remainingBalance + currPoints;
                                    const finalAmount = Math.min(
                                      amount,
                                      maxAllowed,
                                    );
                                    setPaymentMethods((prev) => {
                                      const filtered = prev.filter(
                                        (p) => p.type !== 'points',
                                      );
                                      return [
                                        ...filtered,
                                        { type: 'points', amount: finalAmount },
                                      ];
                                    });
                                  } else {
                                    setPaymentMethods((prev) =>
                                      prev.filter((p) => p.type !== 'points'),
                                    );
                                  }
                                }}
                                value={
                                  paymentMethods.find(
                                    (p) => p.type === 'points',
                                  )?.amount || ''
                                }
                              />
                            </div>
                          </div>
                        )}

                        {/* Auto-complete remaining balance button */}
                        {remainingBalance > 0 && paymentMethods.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              // Auto-complete with the most recently used method or card as default
                              const lastMethod =
                                paymentMethods[paymentMethods.length - 1]
                                  ?.type || 'card';
                              setPaymentMethods((prev) => {
                                const filtered = prev.filter(
                                  (p) => p.type !== lastMethod,
                                );
                                const lastMethodPayment = prev.find(
                                  (p) => p.type === lastMethod,
                                );
                                const newAmount = lastMethodPayment
                                  ? lastMethodPayment.amount + remainingBalance
                                  : remainingBalance;
                                return [
                                  ...filtered,
                                  { type: lastMethod, amount: newAmount },
                                ];
                              });
                            }}
                          >
                            Complete with{' '}
                            {paymentMethods.length > 0
                              ? paymentMethods[paymentMethods.length - 1]?.type
                              : 'Card'}{' '}
                            (${remainingBalance.toFixed(2)})
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Payment Summary */}
                    <div className="text-sm space-y-1 p-2 bg-muted/50 rounded">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Paid:</span>
                        <span>${totalPaymentMethods.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Remaining:</span>
                        <span
                          className={
                            remainingBalance > 0
                              ? 'text-destructive'
                              : 'text-primary'
                          }
                        >
                          ${remainingBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Worker Assignment */}
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-sm">Assign Worker</h4>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search worker"
                      value={workerSearchTerm}
                      onChange={(e) => setWorkerSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {workerSearchTerm && filteredWorkers.length > 0 && (
                    <div className="max-h-32 overflow-auto border rounded-md">
                      {filteredWorkers.map((worker) => (
                        <div
                          key={worker.id}
                          className="p-2 hover:bg-secondary cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            setSelectedWorker(worker);
                            setWorkerSearchTerm('');
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">
                                {worker.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Commission: {worker.commission}%
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  worker.status === 'available'
                                    ? 'secondary'
                                    : worker.status === 'busy'
                                      ? 'destructive'
                                      : 'outline'
                                }
                              >
                                {worker.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedWorker && (
                    <div className="p-3 bg-primary/5 rounded-md border">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-medium">{selectedWorker.name}</p>
                          <Badge variant="secondary">
                            {selectedWorker.commission}% Commission
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Commission Amount:</span>
                        <span className="font-medium text-primary">
                          RM
                          {(
                            total * (selectedWorker.commission / 100) || 0
                          ).toFixed(2)}{' '}
                          - RM{AMOUNT_PER_SERVICE * serviceCount} = RM
                          {(
                            total * (selectedWorker.commission / 100) -
                              AMOUNT_PER_SERVICE * serviceCount || 0
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Member Selection */}
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-sm">Member (Optional)</h4>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search member (name, phone, email)"
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {memberSearchTerm && filteredMembers.length > 0 && (
                    <div className="max-h-32 overflow-auto border rounded-md">
                      {filteredMembers.map((member) => (
                        <div
                          key={member.id}
                          className="p-2 hover:bg-secondary cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            setSelectedMember(member);
                            setMemberSearchTerm('');
                            setClientName(member.name);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">
                                {member.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {member.phone}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="mb-1">
                                {member.membershipLevel}
                              </Badge>
                              <p className="text-xs">
                                <Star className="inline h-3 w-3 mr-1" />
                                {member.points} pts
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedMember && (
                    <div className="p-3 bg-primary/5 rounded-md border">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-medium">{selectedMember.name}</p>
                          <Badge variant="secondary">
                            {selectedMember.membershipLevel}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(null);
                            setClientName('');
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Available Points:</span>
                        <span className="font-medium text-primary">
                          <Star className="inline h-3 w-3 mr-1" />
                          {selectedMember.points} pts ($
                          {(selectedMember.points * pointsValue).toFixed(2)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Client Name Input */}
                <div className="mt-4">
                  <Input
                    placeholder="Client name (optional)"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="h-12"
                    onClick={() => {
                      if (selectedWorker) savePendingTransaction();
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Save Pending
                  </Button>
                  <Button
                    className="h-12"
                    onClick={() => {
                      if (paymentMethods.length === 0) return;
                      completeTransaction(
                        paymentMethods.length > 1
                          ? 'mixed'
                          : paymentMethods[0].type,
                      );
                    }}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && lastTransaction && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          transactionData={lastTransaction}
        />
      )}
    </div>
  );
}
