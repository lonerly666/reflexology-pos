import { TrendingUp, Users, Calendar, DollarSign, Clock, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

function KPICard({ title, value, change, trend, icon }: KPICardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 text-xs">
          <TrendingUp className={`h-3 w-3 ${trend === 'up' ? 'text-success' : 'text-destructive'}`} />
          <span className={trend === 'up' ? 'text-success' : 'text-destructive'}>
            {change}
          </span>
          <span className="text-muted-foreground">from last week</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const todaysAppointments = [
    { id: 1, time: "9:00 AM", client: "Emma Wilson", service: "Full Body Reflexology", therapist: "Sarah Chen", status: "completed" },
    { id: 2, time: "10:30 AM", client: "Michael Brown", service: "Foot Reflexology", therapist: "David Lee", status: "in-progress" },
    { id: 3, time: "12:00 PM", client: "Lisa Garcia", service: "Hot Stone Therapy", therapist: "Sarah Chen", status: "scheduled" },
    { id: 4, time: "2:30 PM", client: "James Miller", service: "Aromatherapy Session", therapist: "Maria Rodriguez", status: "scheduled" },
    { id: 5, time: "4:00 PM", client: "Walk-in", service: "Hand Reflexology", therapist: "Available", status: "available" },
  ];

  const recentTransactions = [
    { id: 1, time: "11:45 AM", client: "Emma Wilson", amount: 80, method: "Card", status: "completed" },
    { id: 2, time: "10:20 AM", client: "Michael Brown", amount: 45, method: "Cash", status: "completed" },
    { id: 3, time: "9:30 AM", client: "Jennifer Davis", amount: 65, method: "Card", status: "completed" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case "in-progress": return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      case "scheduled": return <Badge variant="secondary">Scheduled</Badge>;
      case "available": return <Badge variant="outline">Available</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Today's Revenue"
          value="$1,247"
          change="+15.2%"
          trend="up"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KPICard
          title="Appointments Today"
          value="12"
          change="+8.1%"
          trend="up"
          icon={<Calendar className="h-4 w-4" />}
        />
        <KPICard
          title="Active Clients"
          value="847"
          change="+23.5%"
          trend="up"
          icon={<Users className="h-4 w-4" />}
        />
        <KPICard
          title="Avg Session Time"
          value="42 min"
          change="-2.4%"
          trend="down"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysAppointments.map(appointment => (
                <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{appointment.time}</span>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="font-medium">{appointment.client}</p>
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
                    <p className="text-xs text-muted-foreground">Therapist: {appointment.therapist}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{transaction.time}</span>
                      <Badge variant="outline">{transaction.method}</Badge>
                    </div>
                    <p className="font-medium">{transaction.client}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">${transaction.amount}</span>
                      <Badge className="bg-success text-success-foreground">Paid</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Add New Client</p>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Book Appointment</p>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow p-4 text-center">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Walk-in Service</p>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Cash Out</p>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}