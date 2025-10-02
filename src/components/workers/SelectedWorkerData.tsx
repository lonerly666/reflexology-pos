import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, DollarSign, TrendingUp, Clock, Star } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function SelectedWorkerData(props: any) {
  const [timeRange, setTimeRange] = useState<string>('weekly');
  const [lineChartData, setLineChartData] = useState<any>();
  const [serviceBreakdown, setServiceBreakdown] = useState<any>([]);
  const { selectedWorkerData } = props;

  const getCurrentTimeRange = (
    range: string,
  ): { startDate: string | null; endDate: string | null } => {
    const today = new Date();
    let startDate: Date;
    const endDate = new Date(today); // Default end date is always now

    switch (range) {
      case 'weekly':
        // Start of the current week (Sunday or Monday, depending on locale/standard)
        // Using ISO standard (Monday is 1, Sunday is 7)
        const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
        const diffToMonday =
          today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          diffToMonday,
        );
        startDate.setHours(0, 0, 0, 0);
        break;

      case 'monthly':
        // Start of the current month (day 1)
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0); // Set to midnight
        break;

      case 'annually':
        // Start of the current year (January 1st)
        startDate = new Date(today.getFullYear(), 0, 1); // Month 0 is January
        startDate.setHours(0, 0, 0, 0); // Set to midnight
        break;

      default:
        // 'all time' or an unrecognized range
        return { startDate: null, endDate: null };
    }
    console.log(startDate, endDate);
    return {
      startDate: startDate.toISOString(),
      // We generally don't limit the end date, but for consistency, we use current time.
      endDate: endDate.toISOString(),
    };
  };

  const formatTransactionData = (transactions: any[], range: string) => {
    if (!transactions || transactions.length === 0) {
      return null; // Return null if there's no data
    }

    // Map to store aggregated data: Map<timeKey, ChartDataPoint>
    const aggregationMap = new Map<string, any>();
    const isWeekly = range === 'weekly';
    const isMonthly = range === 'monthly';

    // Constants for labeling
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // 1. Initialize Map for Weekly Data (to ensure all 7 days exist)
    if (isWeekly) {
      // Start with a map containing all days initialized to zero earnings/transactions
      const initialData = initializeWeeklyChartData();
      initialData.forEach((item: any) => {
        // Use the day index (0-6) as the key for reliable sorting later
        aggregationMap.set(dayNames.indexOf(item.timeLabel).toString(), item);
      });
    }

    transactions.forEach((txn) => {
      const date = new Date(txn.date);
      let timeKey: string;
      let timeLabel: string;

      // 1. Determine the key and label based on the range
      if (isWeekly) {
        // Key: Day of the week (0-6). Label: Abbreviated day name.
        timeKey = date.getDay().toString();
        timeLabel = dayNames[date.getDay()];
      } else if (isMonthly) {
        // Key: Month (0-11). Label: Abbreviated month name.
        timeKey = date.getMonth().toString();
        timeLabel = monthNames[date.getMonth()];
      } else {
        // Annually (group by year, though data is usually already year-filtered)
        // Key: Full Year. Label: Full Year string.
        timeKey = date.getFullYear().toString();
        timeLabel = timeKey;
      }

      // 2. Aggregate the data
      const current = aggregationMap.get(timeKey);
      const commission = txn.workerCommissionAmount || 0;

      if (current) {
        // Update existing entry
        current.earnings += commission;
        current.transactions += 1;
        // No need to set the map again, as 'current' is a reference
      } else {
        // Create new entry
        aggregationMap.set(timeKey, {
          timeLabel: timeLabel,
          earnings: commission,
          transactions: 1,
        });
      }
    });

    // 3. Convert Map values to an array and sort
    let finalData = Array.from(aggregationMap.values());

    // Final sorting based on the time type
    if (isWeekly) {
      // Sort by the day index (Mon=1 to Sun=0/7)
      finalData.sort(
        (a, b) => dayNames.indexOf(a.timeLabel) - dayNames.indexOf(b.timeLabel),
      );
    } else if (isMonthly) {
      // Sort by the month index (Jan=0 to Dec=11)
      finalData.sort(
        (a, b) =>
          monthNames.indexOf(a.timeLabel) - monthNames.indexOf(b.timeLabel),
      );
    }

    // 4. Map 'timeLabel' to the desired key ('day', 'month', or 'year')
    const keyMap = isWeekly ? 'day' : isMonthly ? 'month' : 'year';

    return finalData.map((item) => ({
      [keyMap]: item.timeLabel, // Dynamic key assignment
      earnings: parseFloat(item.earnings.toFixed(2)), // Round earnings to 2 decimal places
      transactions: item.transactions,
    }));
  };

  const initializeWeeklyChartData = (): any => {
    // We define the order starting from Monday (as per your example, though Day 0 is Sunday in JS)
    const sortedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return sortedDays.map((day) => ({
      timeLabel: day,
      earnings: 0,
      transactions: 0,
    }));
  };

  const formatServiceBreakdown = (transactions: any) => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Map to store aggregated data: Map<serviceName, ServiceBreakdown>
    const breakdownMap = new Map<string, any>();

    transactions.forEach((txn: any) => {
      // 1. Iterate over the items array of each transaction
      txn.items.forEach((item: any) => {
        const serviceName = item.name;
        const itemQuantity = item.quantity;

        const itemEarnings =
          item.price * itemQuantity * (selectedWorkerData.commission / 100);

        // 2. Aggregate
        const current = breakdownMap.get(serviceName);

        if (current) {
          // Update existing service
          current.count += itemQuantity;
          current.earnings += itemEarnings;
        } else {
          // Create new service entry
          breakdownMap.set(serviceName, {
            service: serviceName,
            count: itemQuantity,
            earnings: itemEarnings,
          });
        }
      });
    });

    // 3. Convert Map values to a final array and sort by earnings (descending)
    return Array.from(breakdownMap.values())
      .map((item) => ({
        ...item,
        // Round earnings to 2 decimal places for display
        earnings: parseFloat(item.earnings.toFixed(2)),
      }))
      .sort((a, b) => b.earnings - a.earnings);
  };

  useEffect(() => {
    console.log(selectedWorkerData);
    const fetchWorkerTransaction = async (id: any) => {
      let params: { start?: string; end?: string } = {};
      const { startDate, endDate } = getCurrentTimeRange(timeRange);
      if (startDate && endDate) {
        params.start = startDate;
        params.end = endDate;
      }
      console.log({ workerId: id, ...params });
      await window.api
        .getWorkerTransactions({ workerId: id, ...params })
        .then((res: any) => {
          if (res.success) {
            console.log(res);
            console.log(
              setLineChartData(
                formatTransactionData(res.transactions, timeRange),
              ),
            );
            console.log(formatServiceBreakdown(res.transactions));
            setServiceBreakdown(formatServiceBreakdown(res.transactions));
          }
        })
        .catch((err) => {
          alert(`Something went wrong: ${err}`);
        });
    };

    fetchWorkerTransaction(selectedWorkerData.id);
  }, []);

  const formatCurrency = (amount: number) => `RM${amount.toFixed(2)}`;
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88'];

  return (
    <div>
      <div className="space-y-6">
        {/* Worker Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(selectedWorkerData.totalGrossEarnings)}
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
              <div className="text-2xl font-bold">
                {selectedWorkerData.totalTransactions}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg: RM {selectedWorkerData.averageTransaction}
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
              <div className="text-2xl font-bold">
                {selectedWorkerData.totalWorkDuration}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Trend */}
        <Card>
          <CardHeader>
            <CardTitle>
              {timeRange === 'annually'
                ? 'Annually'
                : timeRange === 'monthly'
                  ? 'Monthly'
                  : 'Weekly'}{' '}
              Earnings Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={timeRange === 'monthly' ? 'month' : 'day'} />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    'Earnings',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Breakdown */}
        <div className="">
          <Card>
            <CardHeader>
              <CardTitle>Service Breakdown</CardTitle>
            </CardHeader>
            {serviceBreakdown.length > 0 && (
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={serviceBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="earnings"
                      label={({ service, earnings }) =>
                        `${service}: ${formatCurrency(earnings)}`
                      }
                    >
                      {serviceBreakdown.map((entry: any, index: any) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        'Earnings',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
