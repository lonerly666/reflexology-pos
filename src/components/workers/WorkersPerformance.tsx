import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, DollarSign, TrendingUp, Clock, Star } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Worker {
  id: string;
  name: string;
  commission: number;
  status: 'available' | 'busy' | 'break';
  queuePosition: number;
}

interface WorkerPerformance {
  workerId: string;
  workerName: string;
  totalEarnings: number;
  totalTransactions: number;
  averageTransaction: number;
  hoursWorked: number;
  rating: number;
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
    transactions: number;
  }>;
  weeklyEarnings: Array<{
    day: string;
    earnings: number;
    transactions: number;
  }>;
  serviceBreakdown: Array<{
    service: string;
    count: number;
    earnings: number;
  }>;
}

// Mock worker data
const MOCK_WORKERS: Worker[] = [
  { id: "1", name: "Alice Chen", commission: 45, status: "available", queuePosition: 1 },
  { id: "2", name: "Bob Martinez", commission: 50, status: "available", queuePosition: 2 },
  { id: "3", name: "Carol Kim", commission: 40, status: "busy", queuePosition: 3 },
  { id: "4", name: "David Park", commission: 48, status: "available", queuePosition: 4 },
  { id: "5", name: "Emma Rodriguez", commission: 42, status: "break", queuePosition: 5 },
];

// Mock performance data
const MOCK_PERFORMANCE: WorkerPerformance[] = [
  {
    workerId: "1",
    workerName: "Alice Chen",
    totalEarnings: 3240,
    totalTransactions: 156,
    averageTransaction: 20.77,
    hoursWorked: 168,
    rating: 4.8,
    monthlyEarnings: [
      { month: "Jul", earnings: 2100, transactions: 98 },
      { month: "Aug", earnings: 2400, transactions: 112 },
      { month: "Sep", earnings: 2800, transactions: 134 },
      { month: "Oct", earnings: 3100, transactions: 145 },
      { month: "Nov", earnings: 3300, transactions: 152 },
      { month: "Dec", earnings: 3240, transactions: 156 },
    ],
    weeklyEarnings: [
      { day: "Mon", earnings: 520, transactions: 25 },
      { day: "Tue", earnings: 480, transactions: 23 },
      { day: "Wed", earnings: 560, transactions: 27 },
      { day: "Thu", earnings: 445, transactions: 21 },
      { day: "Fri", earnings: 620, transactions: 30 },
      { day: "Sat", earnings: 720, transactions: 35 },
      { day: "Sun", earnings: 385, transactions: 18 },
    ],
    serviceBreakdown: [
      { service: "Full Body Reflexology", count: 45, earnings: 1620 },
      { service: "Foot Reflexology", count: 62, earnings: 1116 },
      { service: "Hot Stone Therapy", count: 28, earnings: 728 },
      { service: "Hand Reflexology", count: 21, earnings: 283 },
    ]
  },
  {
    workerId: "2",
    workerName: "Bob Martinez",
    totalEarnings: 4120,
    totalTransactions: 164,
    averageTransaction: 25.12,
    hoursWorked: 172,
    rating: 4.9,
    monthlyEarnings: [
      { month: "Jul", earnings: 2800, transactions: 112 },
      { month: "Aug", earnings: 3200, transactions: 128 },
      { month: "Sep", earnings: 3600, transactions: 144 },
      { month: "Oct", earnings: 3850, transactions: 154 },
      { month: "Nov", earnings: 4000, transactions: 160 },
      { month: "Dec", earnings: 4120, transactions: 164 },
    ],
    weeklyEarnings: [
      { day: "Mon", earnings: 640, transactions: 32 },
      { day: "Tue", earnings: 600, transactions: 30 },
      { day: "Wed", earnings: 680, transactions: 34 },
      { day: "Thu", earnings: 560, transactions: 28 },
      { day: "Fri", earnings: 750, transactions: 38 },
      { day: "Sat", earnings: 820, transactions: 41 },
      { day: "Sun", earnings: 470, transactions: 24 },
    ],
    serviceBreakdown: [
      { service: "Full Body Reflexology", count: 52, earnings: 2080 },
      { service: "Hot Stone Therapy", count: 38, earnings: 1235 },
      { service: "Foot Reflexology", count: 48, earnings: 1080 },
      { service: "Aromatherapy Session", count: 26, earnings: 520 },
    ]
  },
  {
    workerId: "3",
    workerName: "Carol Kim",
    totalEarnings: 2650,
    totalTransactions: 132,
    averageTransaction: 20.08,
    hoursWorked: 158,
    rating: 4.6,
    monthlyEarnings: [
      { month: "Jul", earnings: 1800, transactions: 90 },
      { month: "Aug", earnings: 2000, transactions: 100 },
      { month: "Sep", earnings: 2200, transactions: 110 },
      { month: "Oct", earnings: 2400, transactions: 120 },
      { month: "Nov", earnings: 2550, transactions: 128 },
      { month: "Dec", earnings: 2650, transactions: 132 },
    ],
    weeklyEarnings: [
      { day: "Mon", earnings: 420, transactions: 21 },
      { day: "Tue", earnings: 380, transactions: 19 },
      { day: "Wed", earnings: 450, transactions: 23 },
      { day: "Thu", earnings: 360, transactions: 18 },
      { day: "Fri", earnings: 500, transactions: 25 },
      { day: "Sat", earnings: 580, transactions: 29 },
      { day: "Sun", earnings: 310, transactions: 16 },
    ],
    serviceBreakdown: [
      { service: "Foot Reflexology", count: 58, earnings: 1044 },
      { service: "Hand Reflexology", count: 42, earnings: 504 },
      { service: "Full Body Reflexology", count: 25, earnings: 800 },
      { service: "Ear Reflexology", count: 18, earnings: 180 },
    ]
  },
  {
    workerId: "4",
    workerName: "David Park",
    totalEarnings: 3480,
    totalTransactions: 145,
    averageTransaction: 24.00,
    hoursWorked: 164,
    rating: 4.7,
    monthlyEarnings: [
      { month: "Jul", earnings: 2200, transactions: 92 },
      { month: "Aug", earnings: 2500, transactions: 104 },
      { month: "Sep", earnings: 2850, transactions: 119 },
      { month: "Oct", earnings: 3100, transactions: 129 },
      { month: "Nov", earnings: 3350, transactions: 140 },
      { month: "Dec", earnings: 3480, transactions: 145 },
    ],
    weeklyEarnings: [
      { day: "Mon", earnings: 560, transactions: 28 },
      { day: "Tue", earnings: 520, transactions: 26 },
      { day: "Wed", earnings: 600, transactions: 30 },
      { day: "Thu", earnings: 480, transactions: 24 },
      { day: "Fri", earnings: 660, transactions: 33 },
      { day: "Sat", earnings: 740, transactions: 37 },
      { day: "Sun", earnings: 420, transactions: 21 },
    ],
    serviceBreakdown: [
      { service: "Hot Stone Therapy", count: 48, earnings: 1498 },
      { service: "Full Body Reflexology", count: 35, earnings: 1344 },
      { service: "Aromatherapy Session", count: 32, earnings: 614 },
      { service: "Foot Reflexology", count: 30, earnings: 648 },
    ]
  },
  {
    workerId: "5",
    workerName: "Emma Rodriguez",
    totalEarnings: 2890,
    totalTransactions: 138,
    averageTransaction: 20.94,
    hoursWorked: 156,
    rating: 4.5,
    monthlyEarnings: [
      { month: "Jul", earnings: 1900, transactions: 95 },
      { month: "Aug", earnings: 2150, transactions: 108 },
      { month: "Sep", earnings: 2400, transactions: 120 },
      { month: "Oct", earnings: 2650, transactions: 133 },
      { month: "Nov", earnings: 2800, transactions: 140 },
      { month: "Dec", earnings: 2890, transactions: 138 },
    ],
    weeklyEarnings: [
      { day: "Mon", earnings: 460, transactions: 23 },
      { day: "Tue", earnings: 420, transactions: 21 },
      { day: "Wed", earnings: 490, transactions: 25 },
      { day: "Thu", earnings: 380, transactions: 19 },
      { day: "Fri", earnings: 550, transactions: 28 },
      { day: "Sat", earnings: 630, transactions: 32 },
      { day: "Sun", earnings: 360, transactions: 18 },
    ],
    serviceBreakdown: [
      { service: "Full Body Reflexology", count: 38, earnings: 1596 },
      { service: "Foot Reflexology", count: 45, earnings: 945 },
      { service: "Hand Reflexology", count: 35, earnings: 441 },
      { service: "Ear Reflexology", count: 20, earnings: 210 },
    ]
  }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88'];

export default function WorkersPerformance() {
  const [selectedWorker, setSelectedWorker] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("weekly");

  const selectedWorkerData = selectedWorker === "all" 
    ? null 
    : MOCK_PERFORMANCE.find(p => p.workerId === selectedWorker);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500 text-white">Available</Badge>;
      case "busy":
        return <Badge variant="destructive">Busy</Badge>;
      case "break":
        return <Badge variant="secondary">On Break</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workers Performance</h1>
          <p className="text-muted-foreground">Track worker performance, earnings, and KPIs</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedWorker} onValueChange={setSelectedWorker}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workers Overview</SelectItem>
              {MOCK_WORKERS.map(worker => (
                <SelectItem key={worker.id} value={worker.id}>
                  {worker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedWorker === "all" ? (
        // All Workers Overview
        <div className="space-y-6">
          {/* Worker Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {MOCK_WORKERS.map(worker => {
              const performance = MOCK_PERFORMANCE.find(p => p.workerId === worker.id);
              return (
                <Card key={worker.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedWorker(worker.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-sm">{worker.name}</span>
                      </div>
                      {getStatusBadge(worker.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Commission:</span>
                        <span className="font-medium">{worker.commission}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Earnings:</span>
                        <span className="font-medium text-primary">
                          {formatCurrency(performance?.totalEarnings || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transactions:</span>
                        <span className="font-medium">{performance?.totalTransactions || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{performance?.rating || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Team Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Team Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(MOCK_PERFORMANCE.reduce((sum, p) => sum + p.totalEarnings, 0))}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {MOCK_PERFORMANCE.reduce((sum, p) => sum + p.totalTransactions, 0)}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    MOCK_PERFORMANCE.reduce((sum, p) => sum + p.averageTransaction, 0) / 
                    MOCK_PERFORMANCE.length
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Per worker</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Team Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {(MOCK_PERFORMANCE.reduce((sum, p) => sum + p.rating, 0) / MOCK_PERFORMANCE.length).toFixed(1)}
                  </div>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-xs text-muted-foreground">Average rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Team Earnings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Team Earnings Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={MOCK_PERFORMANCE}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="workerName" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Earnings']} />
                  <Bar dataKey="totalEarnings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Individual Worker Performance
        selectedWorkerData && (
          <div className="space-y-6">
            {/* Worker Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedWorkerData.totalEarnings)}
                  </div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedWorkerData.totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatCurrency(selectedWorkerData.averageTransaction)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Hours Worked
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedWorkerData.hoursWorked}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(selectedWorkerData.totalEarnings / selectedWorkerData.hoursWorked)}/hr
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{selectedWorkerData.rating}</div>
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">Customer rating</p>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Trend */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {timeRange === "monthly" ? "Monthly" : "Weekly"} Earnings Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeRange === "monthly" ? selectedWorkerData.monthlyEarnings : selectedWorkerData.weeklyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeRange === "monthly" ? "month" : "day"} />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Earnings']} />
                    <Line type="monotone" dataKey="earnings" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Service Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={selectedWorkerData.serviceBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="earnings"
                        label={({service, earnings}) => `${service}: ${formatCurrency(earnings)}`}
                      >
                        {selectedWorkerData.serviceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Earnings']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedWorkerData.serviceBreakdown.map((service, index) => (
                      <div key={service.service} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{service.service}</div>
                          <div className="text-xs text-muted-foreground">
                            {service.count} sessions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(service.earnings)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(service.earnings / service.count)}/session
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      )}
    </div>
  );
}