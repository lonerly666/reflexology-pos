import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Worker } from '@/interfaces/Worker';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88'];

export default function WorkersPerformance() {
  const [selectedWorker, setSelectedWorker] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('weekly');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [newWorker, setNewWorker] = useState({
    id: -1,
    name: '',
    commission: 0,
    joinDate: '',
    totalEarnings: 0,
    totalTransactions: 0,
    workDuration: 0,
  });

  useEffect(() => {
    const fetchWorkers = async () => {
      await window.api
        .getWorkers()
        .then((res: any) => {
          console.log(res);
          setWorkers(res.workerInfo);
        })
        .catch((err) => {
          console.log(err);
          return { success: 'false', err };
        });
    };
    fetchWorkers();
  }, []);

  const formatCurrency = (amount: number) => `RM${amount.toFixed(2)}`;
  const formatData = (data: any) => {
    return Array.from(data.values());
  };
  const formatDate = (data: any) => {
    const date = new Date(data);
    const day = String(date.getDate()).padStart(2, '0');
    // Note: getMonth() is 0-indexed (0=Jan), so add 1
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };

  const handleSubmit = async (type: any) => {
    const worker = {
      id: newWorker.id,
      name: newWorker.name,
      commission: newWorker.commission,
      joinDate: newWorker.joinDate,
      totalEarnings: newWorker.totalEarnings,
      totalTransactions: newWorker.totalTransactions,
      workDuration: newWorker.workDuration,
    };
    if (type === 'update') {
      await window.api
        .updateWorker(worker)
        .then((res) => {
          if (res.success) {
            setWorkers((prev: any) => {
              return prev.map((t: any) => {
                if (Number(t.id) === worker.id) {
                  return worker;
                }
                return t;
              });
            });
            setIsEdit(false);
            setOpenDialog(false);
            resetNewWorker();
          } else {
            alert('Something went wrong!');
          }
        })
        .catch((err) => {
          alert(`Something went wrong: ${err}`);
        });
    } else {
      worker.joinDate = new Date().toISOString();
      await window.api
        .addWorker(worker)
        .then((res) => {
          if (res.success) {
            worker.id = res.info.lastInsertRowid;
            console.log(worker);
            setWorkers([...workers, worker]);
            setOpenDialog(false);
            resetNewWorker();
          } else {
            alert(`Something went wrong!`);
          }
        })
        .catch((err) => {
          alert(`Something went wrong: ${err}`);
        });
    }
  };

  const resetNewWorker = () => {
    setNewWorker({
      id: -1,
      name: '',
      commission: 0,
      joinDate: '',
      totalEarnings: 0,
      totalTransactions: 0,
      workDuration: 0,
    });
  };

  return (
    <div className="space-y-6">
      <Dialog
        open={openDialog}
        onOpenChange={(e) => {
          if (!e) {
            resetNewWorker();
            setIsEdit(false);
            setIsDelete(false);
          }
          setOpenDialog(e);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isDelete
                ? 'Are you sure?'
                : isEdit
                  ? 'Edit Worker'
                  : 'Add New Worker'}
            </DialogTitle>
          </DialogHeader>
          {isDelete ? (
            <div className="flex gap-4 p-4">
              <Button
                variant={'destructive'}
                className="w-full"
                onClick={() => {
                  // handleDelete(newService.id);
                }}
              >
                {' '}
                Yes{' '}
              </Button>
              <Button
                className="w-full"
                variant={'default'}
                onClick={() => {
                  setOpenDialog(false);
                  setIsDelete(false);
                }}
              >
                {' '}
                No{' '}
              </Button>
            </div>
          ) : (
            <div>
              <div className="p-4 grid gap-4">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newWorker.name || ''}
                  onChange={(e) => {
                    setNewWorker({ ...newWorker, name: e.target.value });
                  }}
                  placeholder="Enter Service Name"
                />
              </div>
              <div className="p-4 grid gap-4">
                <Label htmlFor="commission">Commission (%)</Label>
                <Input
                  id="commission"
                  value={newWorker.commission || ''}
                  type="number"
                  min={0}
                  placeholder="Enter worker's commission"
                  onChange={(e) => {
                    setNewWorker({
                      ...newWorker,
                      commission: Number(e.target.value),
                    });
                  }}
                />
              </div>
              <Button
                onClick={() => {
                  handleSubmit(isEdit ? 'update' : 'create');
                }}
                className="w-full mt-10"
                variant={isEdit ? 'default' : 'active'}
              >
                {isEdit ? 'Update' : 'Submit'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workers Performance</h1>
          <p className="text-muted-foreground">
            Track worker performance, earnings, and KPIs
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedWorker} onValueChange={setSelectedWorker}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workers Overview</SelectItem>
              {workers.map((worker) => (
                <SelectItem key={worker.id} value={String(worker.id)}>
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
      <Card className="relative">
        <Button
          onClick={() => setOpenDialog(true)}
          variant={'active'}
          className="absolute top-5 right-6"
        >
          Add New Worker
        </Button>
        <CardHeader>
          <CardTitle>Worker Directory</CardTitle>
          <CardDescription>View and manage all your workers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Total Earning</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3 justify-center">
                      <div>
                        <div className="font-medium">{worker.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {formatDate(worker.joinDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      RM {worker.totalEarnings}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {worker.commission}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEdit(true);
                          setOpenDialog(true);
                          setNewWorker({
                            id: worker.id,
                            name: worker.name,
                            commission: worker.commission,
                            joinDate: worker.joinDate,
                            totalEarnings: worker.totalEarnings,
                            totalTransactions: worker.totalTransactions,
                            workDuration: worker.workDuration
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {workers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  No Workers Available
                </h3>
                <p className="text-muted-foreground">Please add new workers</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Team Earnings Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  'Earnings',
                ]}
              />
              <Bar dataKey="totalEarnings" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
