import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Trash, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '../ui/label';
import { Service } from '@/interfaces/Service';

const AVAILABLE_CATEGORY = ['All', 'Package', 'Normal', 'Small Service'];

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isDelete, setIsDelete] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [newService, setNewService] = useState({
    id: -1,
    name: '',
    duration: 0,
    price: 0,
    category: 'Normal',
  });

  useEffect(() => {
    const fetchService = async () => {
      await window.api
        .getServices()
        .then((res) => {
          console.log(res);
          setServices(res);
        })
        .catch((err) => {
          alert(`Something went wrong: ${err}`);
        });
    };

    fetchService();
  }, []);

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetNewService = () => {
    setNewService({
      id: -1,
      name: '',
      duration: 0,
      price: 0,
      category: 'Normal',
    });
  };

  const handleDelete = async (id: any) => {
    await window.api
      .deleteService(id)
      .then((res) => {
        if (res.success) {
          setServices((prev) => {
            return prev.filter((t) => {
              return t.id !== id;
            });
          });
          setOpenDialog(false);
          setIsDelete(false);
          resetNewService();
        } else {
          alert(`Something went wrong, try again later`);
        }
      })
      .catch((err) => {
        alert(`Something went wrong: ${err}`);
      });
  };

  const handleSubmit = async (type: String) => {
    const service = {
      id: newService.id,
      name: newService.name,
      duration: newService.duration,
      price: newService.price,
      category: newService.category,
    };
    if (type === 'update') {
      await window.api
        .updateService(service)
        .then((res) => {
          if (!res.success) {
            alert(`Something went wrong, please try again later`);
            return;
          }
          setServices((prev: any) => {
            return prev.map((t: any) => {
              if (Number(t.id) === service.id) {
                return { ...service };
              }
              return t;
            });
          });
          setIsEdit(false);
        })
        .catch((err) => {
          alert(`Something went wrong: ${err}`);
        });
    } else {
      await window.api
        .addService(service)
        .then((res) => {
          service.id = res.lastInsertRowid;
          setServices((prev: any) => {
            return [...prev, service];
          });
        })
        .catch((err) => {
          alert(`Something went wrong: ${err}`);
        });
    }

    setOpenDialog(false);
    resetNewService();
  };

  return (
    <div>
      <Dialog
        open={openDialog}
        onOpenChange={(e) => {
          if (!e) {
            resetNewService();
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
                  ? 'Edit Service'
                  : 'Add New Service'}
            </DialogTitle>
          </DialogHeader>
          {isDelete ? (
            <div className="flex gap-4 p-4">
              <Button
                variant={'destructive'}
                className="w-full"
                onClick={() => {
                  handleDelete(newService.id);
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
                  value={newService.name || ''}
                  onChange={(e) => {
                    setNewService({ ...newService, name: e.target.value });
                  }}
                  placeholder="Enter Service Name"
                />
              </div>
              <div className="p-4 grid gap-4">
                <Label htmlFor="duration">Duration (mins)</Label>
                <Input
                  id="duration"
                  value={newService.duration || ''}
                  type="number"
                  min={0}
                  placeholder="Enter service duration"
                  onChange={(e) => {
                    setNewService({
                      ...newService,
                      duration: Number(e.target.value),
                    });
                  }}
                />
              </div>
              <div className="p-4 grid gap-4">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={newService.price || ''}
                  type="number"
                  min={0}
                  placeholder="Enter service price"
                  onChange={(e) => {
                    setNewService({
                      ...newService,
                      price: Number(e.target.value),
                    });
                  }}
                />
              </div>
              <div className="p-4 grid gap-4">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newService.category}
                  onValueChange={(e) => {
                    setNewService({ ...newService, category: e });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_CATEGORY.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
      <Card className="h-full ">
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
                {AVAILABLE_CATEGORY.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={'active'}
              onClick={() => {
                setOpenDialog(true);
              }}
            >
              Add New Service
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-10 grid grid-cols-2 gap-8 text-center">
          {filteredServices.map((service, index) => {
            return (
              <Card key={index} className="w-[90%] justify-self-center">
                <CardContent className="p-10 relative">
                  <div className="flex justify-start items-start mb-2">
                    <h3 className="font-medium text-sm leading-tight">
                      {service.name}
                    </h3>
                    <Badge variant="secondary" className="ml-2">
                      {service.duration}min
                    </Badge>
                  </div>
                  <div className="flex justify-start items-center gap-3">
                    <span className="text-lg font-bold text-primary">
                      RM {service.price}
                    </span>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                  <div className="absolute right-8 top-1/2 translate-y-[-50%] flex gap-2">
                    <Button
                      variant={'outline'}
                      onClick={() => {
                        setIsEdit(true);
                        setOpenDialog(true);
                        setNewService({
                          ...newService,
                          id: Number(service.id),
                          name: service.name,
                          category: service.category,
                          price: Number(service.price),
                          duration: Number(service.duration),
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setNewService({
                          ...newService,
                          id: Number(service.id),
                        });
                        setIsDelete(true);
                        setOpenDialog(true);
                      }}
                    >
                      <Trash />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
