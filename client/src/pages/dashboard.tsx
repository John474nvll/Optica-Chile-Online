import { useAuth } from "@/hooks/use-auth";
import { useAppointments } from "@/hooks/use-appointments";
import { useOrders } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Package, User, Plus } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: appointments } = useAppointments(user?.id);
  const { data: orders } = useOrders(user?.id);

  // Status badge helper
  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      confirmed: "bg-green-100 text-green-700",
      scheduled: "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${colors[status] || "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / Profile Card */}
        <aside className="w-full md:w-80 space-y-6">
          <Card className="overflow-hidden border-border/50 shadow-lg">
            <div className="h-24 bg-gradient-to-r from-primary to-primary/80"></div>
            <CardContent className="pt-0 relative">
              <div className="absolute -top-12 left-6">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="mt-14 mb-4">
                <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">{new Date().getFullYear()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
             <CardContent className="p-4">
               <Link href="/appointments">
                 <Button className="w-full gap-2" variant="outline">
                   <Plus className="w-4 h-4" /> Book Appointment
                 </Button>
               </Link>
             </CardContent>
          </Card>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold mb-6">Patient Dashboard</h1>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="appointments" className="rounded-lg">Appointments</TabsTrigger>
              <TabsTrigger value="orders" className="rounded-lg">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 animate-in-fade">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Appointments</CardTitle>
                    <Calendar className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{appointments?.filter(a => a.status === 'scheduled').length || 0}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
                    <Package className="w-4 h-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{orders?.filter(o => o.status === 'pending').length || 0}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg">Recent Activity</h3>
                {appointments?.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-card border rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Appointment with {apt.doctorName || "Doctor"}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(apt.date), "PPP p")}</p>
                      </div>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="appointments" className="animate-in-fade">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No appointments found.</div>
                  ) : (
                    <div className="space-y-4">
                       {appointments?.map((apt) => (
                          <div key={apt.id} className="flex items-center justify-between p-4 border rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className="bg-muted p-2 rounded-lg">
                                <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium">{apt.reason || "General Checkup"}</p>
                                <p className="text-sm text-muted-foreground">{format(new Date(apt.date), "PPP p")}</p>
                              </div>
                            </div>
                            <StatusBadge status={apt.status} />
                          </div>
                       ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="animate-in-fade">
              <Card>
                <CardHeader>
                  <CardTitle>My Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No orders found.</div>
                  ) : (
                    <div className="space-y-4">
                      {orders?.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium">Order #{order.id}</p>
                              <p className="text-sm text-muted-foreground">{format(new Date(order.date!), "PPP")}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${order.totalAmount}</p>
                            <StatusBadge status={order.status} />
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
      </div>
    </div>
  );
}
