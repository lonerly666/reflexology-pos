import { useState } from "react";
import { Calendar, Clock, User, Phone, Mail, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface TimeSlot {
  time: string;
  available: boolean;
  therapist: string;
}

export default function AppointmentBooking() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [clientInfo, setClientInfo] = useState({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });

  const services = [
    { id: "1", name: "Full Body Reflexology", duration: 60, price: 80 },
    { id: "2", name: "Foot Reflexology", duration: 30, price: 45 },
    { id: "3", name: "Hand Reflexology", duration: 20, price: 30 },
    { id: "4", name: "Hot Stone Therapy", duration: 45, price: 65 },
    { id: "5", name: "Aromatherapy Session", duration: 30, price: 40 },
  ];

  const timeSlots: TimeSlot[] = [
    { time: "9:00 AM", available: true, therapist: "Sarah Chen" },
    { time: "9:30 AM", available: false, therapist: "David Lee" },
    { time: "10:00 AM", available: true, therapist: "Maria Rodriguez" },
    { time: "10:30 AM", available: false, therapist: "Sarah Chen" },
    { time: "11:00 AM", available: true, therapist: "David Lee" },
    { time: "11:30 AM", available: true, therapist: "Maria Rodriguez" },
    { time: "12:00 PM", available: true, therapist: "Sarah Chen" },
    { time: "12:30 PM", available: false, therapist: "David Lee" },
    { time: "1:00 PM", available: true, therapist: "Maria Rodriguez" },
    { time: "1:30 PM", available: true, therapist: "Sarah Chen" },
    { time: "2:00 PM", available: true, therapist: "David Lee" },
    { time: "2:30 PM", available: false, therapist: "Maria Rodriguez" },
    { time: "3:00 PM", available: true, therapist: "Sarah Chen" },
    { time: "3:30 PM", available: true, therapist: "David Lee" },
    { time: "4:00 PM", available: true, therapist: "Maria Rodriguez" },
    { time: "4:30 PM", available: true, therapist: "Sarah Chen" },
  ];

  const selectedServiceDetails = services.find(s => s.id === selectedService);

  const handleBooking = () => {
    console.log("Booking appointment:", {
      date: selectedDate,
      service: selectedService,
      timeSlot: selectedTimeSlot,
      client: clientInfo
    });
    // This would integrate with Supabase to save the appointment
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Book New Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Selection */}
            <div>
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Service Selection */}
            <div>
              <Label>Select Service</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{service.name}</span>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="secondary">{service.duration}min</Badge>
                          <Badge variant="outline">${service.price}</Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Slot Selection */}
            {selectedService && (
              <div>
                <Label>Available Time Slots</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {timeSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                      disabled={!slot.available}
                      onClick={() => setSelectedTimeSlot(slot.time)}
                      className="h-16 flex flex-col items-center justify-center"
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm font-medium">{slot.time}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{slot.therapist}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Client Information */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Client Information</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="name"
                      placeholder="Enter client name"
                      className="pl-10"
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="phone"
                      placeholder="(555) 123-4567"
                      className="pl-10"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="client@example.com"
                    className="pl-10"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Special Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or health considerations..."
                  value={clientInfo.notes}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Summary */}
      <div className="col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedServiceDetails ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Service:</span>
                    <span className="font-medium">{selectedServiceDetails.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span>{selectedServiceDetails.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="font-bold text-primary">${selectedServiceDetails.price}</span>
                  </div>
                </div>

                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span>{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                )}

                {selectedTimeSlot && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time:</span>
                    <span>{selectedTimeSlot}</span>
                  </div>
                )}

                {clientInfo.name && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Client:</span>
                    <span>{clientInfo.name}</span>
                  </div>
                )}

                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleBooking}
                  disabled={!selectedService || !selectedTimeSlot || !clientInfo.name || !clientInfo.phone}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Confirm Booking
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a service to see booking details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}