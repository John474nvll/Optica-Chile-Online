import { useAuth } from "@/hooks/use-auth";
import { useUserRole } from "@/hooks/use-roles";
import { useAppointments } from "@/hooks/use-appointments";
import { useOrders } from "@/hooks/use-orders";
import { ROLES, APPOINTMENT_STATUS } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Package, FileText, Clock, Plus } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: roleData, isLoading: roleLoading } = useUserRole(user?.id);
  const { data: appointments } = useAppointments({ patientId: user?.id });
  const { data: orders } = useOrders({ patientId: user?.id });

  if (roleLoading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const role = roleData?.role || ROLES.PATIENT;

  // Render different dashboards based on role
  if (role === ROLES.ADMIN || role === ROLES.STAFF) {
    return <AdminDashboard />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Patient Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.firstName}</p>
        </div>
        <Link href="/appointments">
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          icon={<Calendar className="text-primary" />}
          label="Upcoming Appointments"
          value={appointments?.filter(a => a.status === APPOINTMENT_STATUS.SCHEDULED).length || 0}
        />
        <StatsCard 
          icon={<Package className="text-indigo-500" />}
          label="Active Orders"
          value={orders?.filter(o => o.status !== "delivered").length || 0}
        />
        <StatsCard 
          icon={<FileText className="text-emerald-500" />}
          label="Prescriptions"
          value="2" // Placeholder or fetch real count
        />
      </div>

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="bg-white border">
          <TabsTrigger value="appointments">My Appointments</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="mt-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Upcoming Visits</CardTitle>
              <CardDescription>Manage your scheduled eye exams and follow-ups.</CardDescription>
            </CardHeader>
            <CardContent>
              {!appointments?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No appointments scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border text-primary font-bold shadow-sm">
                          {format(new Date(apt.date), "dd")}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{format(new Date(apt.date), "MMMM yyyy • h:mm a")}</p>
                          <p className="text-sm text-muted-foreground">{apt.reason || "General Checkup"}</p>
                        </div>
                      </div>
                      <Badge variant={apt.status === "confirmed" ? "default" : "secondary"}>
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="mt-6">
           <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>Track status of your glasses and contact lenses.</CardDescription>
            </CardHeader>
            <CardContent>
              {!orders?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No orders yet.</p>
                  <Link href="/shop" className="text-primary hover:underline mt-2 inline-block">Start Shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-border/50 hover:shadow-md transition-shadow">
                      <div>
                        <p className="font-semibold text-slate-900">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">Placed on {order.createdAt ? format(new Date(order.createdAt), "MMM dd, yyyy") : "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">${order.totalAmount}</p>
                        <Badge variant="outline" className="mt-1 capitalize">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-xl">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold font-display text-slate-900">{value}</p>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-display text-slate-900">Staff Dashboard</h1>
      <p className="text-muted-foreground">Welcome to the clinic management system.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5"/> Inventory</CardTitle>
              <CardDescription>Manage products & stock</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/appointments">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-emerald-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5"/> Schedule</CardTitle>
              <CardDescription>View clinic calendar</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        {/* Add more admin links */}
      </div>
    </div>
  );
}
