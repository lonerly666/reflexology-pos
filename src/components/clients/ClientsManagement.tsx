import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalSpent: number;
  lastVisit: string;
  points: number;
}

export default function ClientsManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isTopUp, setIsTopUp] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [isDelete, setIsDelete] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    points: 0,
  });

  useEffect(() => {
    window.api
      .getMembers()
      .then((res) => {
        setClients(res);
      })
      .catch((err) => {
        alert(`Something went wrong: ${err}`);
      });
  }, []);

  const resetNewClientState = () => {
    setNewClient({
      name: '',
      email: '',
      phone: '',
      points: 0,
    });
  };

  const handleDeleteMember = async () => {
    await window.api
      .deleteMember(Number(newClient.id))
      .then((res) => {
        if (res.success) {
          setClients((prev) => {
            return prev.filter((t: any) => {
              return t.id !== newClient.id;
            });
          });
          setIsDelete(false);
          setIsAddClientOpen(false);
          resetNewClientState();
        }
      })
      .catch((err) => {
        alert(`Something went wrong: ${err}`);
      });
  };

  const handleAddClient = async () => {
    if (newClient.name && newClient.phone && newClient.points) {
      const client: Client = {
        id: newClient.id ? newClient.id : -1,
        name: newClient.name!,
        email: newClient.email!,
        phone: newClient.phone!,
        joinDate: new Date().toISOString(),
        totalSpent: 0,
        lastVisit: new Date().toISOString(),
        points: newClient.points!,
      };
      await window.api
        .addMember(client)
        .then((res) => {
          console.log('New Member Added!', res);
          setClients([...clients, client]);
          resetNewClientState();
          setIsAddClientOpen(false);
        })
        .catch((err) => {
          alert(`Something went wrong: ${err}`);
        });
    }
  };

  const handleUpdate = async () => {
    await window.api
      .updateMember(newClient)
      .then((res) => {
        console.log('Member Updated:', res);
        setClients((prev: any) => {
          return prev.map((t: any) => {
            if (t.id === newClient.id) {
              return newClient;
            }
          });
        });
        resetNewClientState();
        setIsAddClientOpen(false);
      })
      .catch((err) => {
        alert(`Something went wrong: ${err}`);
      });
  };

  const handleTopup = async () => {
    const totalBalance = Number(newClient.points) + amount;
    const data = {
      update: 'topup',
      id: newClient.id,
      points: totalBalance,
    };
    await window.api
      .updateMember(data)
      .then(() => {
        setClients((prev: any) => {
          return prev.map((t: any) => {
            if (t.id === newClient.id) {
              return { ...t, points: totalBalance };
            }
          });
        });
        setAmount(0);
        resetNewClientState();
        setIsTopUp(false);
      })
      .catch((err) => {
        alert(`Something went wrong: ${err}`);
      });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your clients and their information
          </p>
        </div>
        <Dialog open={isDelete} onOpenChange={setIsDelete}>
          <DialogTrigger asChild>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center">
                  Confirm To Delete?
                </DialogTitle>
              </DialogHeader>
              <div className="flex w-full justify-center space-x-10 p-3">
                <Button
                  className="w-full"
                  variant={'destructive'}
                  onClick={handleDeleteMember}
                >
                  Yes
                </Button>
                <Button
                  className="w-full"
                  variant={'active'}
                  onClick={() => {
                    setIsDelete(false);
                  }}
                >
                  No
                </Button>
              </div>
            </DialogContent>
          </DialogTrigger>
        </Dialog>
        <Dialog open={isTopUp} onOpenChange={setIsTopUp}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Top Up Member Points</DialogTitle>
              <DialogDescription>Enter Amount of Points</DialogDescription>
            </DialogHeader>
            <div className="grid py-4">
              <Input
                defaultValue={0}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                }}
              />
            </div>
            <Button variant="active" onClick={handleTopup}>
              COMPLETE
            </Button>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isAddClientOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              resetNewClientState();
            }
            setIsAddClientOpen(isOpen);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {newClient.id ? 'Update Client' : 'Add New Client'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newClient.name || ''}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  placeholder="Enter client's full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email || ''}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  placeholder="client@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={newClient.phone || ''}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {!newClient.id && (
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    value={newClient.points || 0}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        points: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  resetNewClientState();
                  setIsAddClientOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="w-full"
                onClick={newClient.id ? handleUpdate : handleAddClient}
              >
                {newClient.id ? 'Update Client' : 'Add Client'}
              </Button>
            </div>
            {newClient.id && (
              <div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    setIsDelete(true);
                  }}
                >
                  Delete Member
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                clients.reduce((sum, client) => sum + client.totalSpent, 0),
              )}
            </div>
            <p className="text-xs text-muted-foreground">From all clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                clients.filter(
                  (c) =>
                    new Date(c.joinDate).getMonth() === new Date().getMonth(),
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">March 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                clients.reduce((sum, client) => sum + client.totalSpent, 0) /
                  clients.length,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per client</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
          <CardDescription>View and manage all your clients</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3 justify-center">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined{' '}
                          {new Date(client.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center text-sm justify-center">
                          <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                          {client.email}
                        </div>
                      )}
                      <div className="flex items-center text-sm justify-center">
                        <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                        {client.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(client.totalSpent)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(client.lastVisit).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{client.points}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewClient(client);
                          setIsAddClientOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="active"
                        size="sm"
                        onClick={() => {
                          setNewClient((prev) => {
                            return {
                              ...prev,
                              id: client.id,
                              points: client.points,
                            };
                          });
                          setIsTopUp(true);
                        }}
                      >
                        Top Up
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
