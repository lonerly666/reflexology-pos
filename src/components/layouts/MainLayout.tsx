import { useState } from "react";
import {
  Users,
  Calendar,
  ShoppingCart,
  Package,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Clock,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface MainLayoutProps {
  children: React.ReactNode;
  currentUser?: {
    name: string;
    role: "Admin" | "Manager" | "Cashier" | "Therapist";
    initials: string;
  };
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function MainLayout({
  children,
  currentUser = { name: "Sarah Johnson", role: "Cashier", initials: "SJ" },
  activeSection = "pos",
  onSectionChange,
}: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { id: "pos", label: "Point of Sale", icon: ShoppingCart, roles: ["Admin", "Manager", "Cashier"] },
    { id: "pending", label: "Pending Orders", icon: Clock, roles: ["Admin", "Manager", "Cashier"] },
    { id: "appointments", label: "Appointments", icon: Calendar, roles: ["Admin", "Manager", "Therapist"] },
    { id: "workers", label: "Worker", icon: UserCheck, roles: ["Admin", "Manager", "Cashier", "Therapist"] },
    { id: "clients", label: "Clients", icon: Users, roles: ["Admin", "Manager", "Cashier", "Therapist"] },
    { id: "inventory", label: "Inventory", icon: Package, roles: ["Admin", "Manager"] },
    { id: "reports", label: "Reports", icon: BarChart3, roles: ["Admin", "Manager"] },
    { id: "invoices", label: "Invoices", icon: FileText, roles: ["Admin", "Manager", "Cashier"] },
    { id: "settings", label: "Settings", icon: Settings, roles: ["Admin", "Manager"] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-destructive text-destructive-foreground";
      case "Manager": return "bg-warning text-warning-foreground";
      case "Cashier": return "bg-primary text-primary-foreground";
      case "Therapist": return "bg-success text-success-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`relative bg-card border-r border-border transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg text-primary">ZenTouch POS</h1>
                <p className="text-sm text-muted-foreground">Reflexology Centre</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currentUser.initials}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentUser.name}</p>
                <Badge variant="secondary" className={getRoleBadgeColor(currentUser.role)}>
                  {currentUser.role}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start mb-1 ${
                  isActive ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => onSectionChange?.(item.id)}
              >
                <Icon className="h-5 w-5" />
                {!sidebarCollapsed && <span className="ml-3">{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-3 w-[90%]">
          <Button variant="ghost" className="w-[100%] justify-start text-destructive hover:text-destructive">
            <LogOut className="h-5 w-5" />
            {!sidebarCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold capitalize">
              {activeSection?.replace(/([A-Z])/g, ' $1').trim()}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Today: {new Date().toLocaleDateString()}</span>
              <span>•</span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}