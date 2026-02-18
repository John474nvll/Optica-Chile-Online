import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Loader2, FileText, Calendar, ShoppingBag, Printer, Users, Settings, Package, Plus, ClipboardList } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const { data: prescriptions, isLoading: loadingPrescriptions } = useQuery({
    queryKey: [api.prescriptions.list.path, { patientId: user?.id }],
    enabled: !!user && !isAdmin,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: [api.orders.list.path, { patientId: user?.id }],
    enabled: !!user && !isAdmin,
  });

  const { data: allUsers } = useQuery({
    queryKey: [api.users.list.path],
    enabled: !!user && isAdmin,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(api.users.updateRole.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({ title: "Éxito", description: "Rol de usuario actualizado correctamente." });
    }
  });

  const printPrescription = async (id: number) => {
    const res = await fetch(buildUrl(api.prescriptions.print.path, { id }));
    const data = await res.json();
    if (data.html) {
      const win = window.open('', '_blank');
      win?.document.write(data.html);
      win?.document.close();
      win?.focus();
      setTimeout(() => win?.print(), 500);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Bienvenido, {user.firstName || 'Usuario'}</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            {isAdmin ? "Panel de Gestión Administrativa" : "Tus recetas, citas y pedidos en un solo lugar."}
          </p>
        </div>
        {!isAdmin && (
          <Button asChild className="rounded-full shadow-lg">
            <a href="/appointments"><Plus className="mr-2 h-4 w-4" /> Agendar Cita</a>
          </Button>
        )}
      </div>

      {isAdmin ? (
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="users" className="rounded-lg">
              <Users className="mr-2 h-4 w-4" /> Usuarios
            </TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-lg">
              <Package className="mr-2 h-4 w-4" /> Inventario
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg">
              <ShoppingBag className="mr-2 h-4 w-4" /> Pedidos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-6">
            <Card className="border-border/50 shadow-md">
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>Controla el acceso y roles de la plataforma.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol Actual</TableHead>
                      <TableHead className="text-right">Cambiar Rol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers?.map((u: any) => (
                      <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'staff' ? 'default' : 'secondary'}>
                            {u.role === 'admin' ? 'Admin' : u.role === 'staff' ? 'Staff' : 'Paciente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={updateRoleMutation.isPending}
                            onClick={() => updateRoleMutation.mutate({ userId: u.id, role: 'admin' })}
                          >Admin</Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={updateRoleMutation.isPending}
                            onClick={() => updateRoleMutation.mutate({ userId: u.id, role: 'staff' })}
                          >Staff</Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={updateRoleMutation.isPending}
                            onClick={() => updateRoleMutation.mutate({ userId: u.id, role: 'patient' })}
                          >Paciente</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory">
            <Card className="border-border/50 shadow-md">
              <CardHeader>
                <CardTitle>Inventario de Productos</CardTitle>
                <CardDescription>Catálogo de armazones, cristales y accesorios.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground mb-4">Administra los productos de la tienda.</p>
                <Button asChild>
                  <a href="/shop">Ir a la Tienda</a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="border-border/50 shadow-md">
              <CardHeader>
                <CardTitle>Historial de Pedidos</CardTitle>
                <CardDescription>Monitoreo global de ventas y despachos.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">Módulo de pedidos maestros activo.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xl">Mis Recetas Ópticas</CardTitle>
                <CardDescription>Accede a tus fórmulas y prescripciones.</CardDescription>
              </div>
              <FileText className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="pt-6">
              {loadingPrescriptions ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-4">
                  {!prescriptions || prescriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No tienes recetas registradas todavía.</p>
                      <Button variant="outline" size="sm">Solicitar Transcripción</Button>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Doctor</TableHead>
                            <TableHead className="text-right">Acción</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {prescriptions.map((p: any) => (
                            <TableRow key={p.id} className="hover:bg-muted/20">
                              <TableCell className="font-medium">{new Date(p.date).toLocaleDateString()}</TableCell>
                              <TableCell>{p.doctorName || 'Dr. General'}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => printPrescription(p.id)} title="Imprimir Receta">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <CardHeader className="bg-purple-500/5 border-b flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xl">Seguimiento de Pedidos</CardTitle>
                <CardDescription>Estado de tus compras y despachos.</CardDescription>
              </div>
              <ShoppingBag className="h-6 w-6 text-purple-600" />
            </CardHeader>
            <CardContent className="pt-6">
              {loadingOrders ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
              ) : (
                <div className="space-y-4">
                  {!orders || orders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No has realizado pedidos.</p>
                      <Button variant="outline" size="sm" asChild><a href="/shop">Explorar Tienda</a></Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((o: any) => (
                        <div key={o.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold">Orden #{o.id}</p>
                              <p className="text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold mb-1">${Number(o.totalAmount).toLocaleString('es-CL')}</p>
                            <Badge className="capitalize">{o.status.replace('_', ' ')}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
