import { useProducts, useCreateProduct } from "@/hooks/use-products";
import { useAuth } from "@/hooks/use-auth";
import { useUserRole } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, PRODUCT_CATEGORIES, ROLES } from "@shared/schema";
import { z } from "zod";

export default function Shop() {
  const [filter, setFilter] = useState("");
  const { data: products, isLoading } = useProducts();
  const { user } = useAuth();
  const { data: roleData } = useUserRole(user?.id);

  const isAdmin = roleData?.role === ROLES.ADMIN || roleData?.role === ROLES.STAFF;

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.brand?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Eyewear Collection</h1>
          <p className="text-muted-foreground mt-1">Discover frames, lenses, and accessories.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search frames..." 
              className="pl-9 bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
          {isAdmin && <AddProductDialog />}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts?.map((product) => (
            <Card key={product.id} className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden flex items-center justify-center p-6">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="text-slate-300">
                    <ShoppingCart className="w-12 h-12" />
                  </div>
                )}
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                    <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-bold text-primary tracking-wider uppercase">{product.brand}</p>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                  </div>
                  <Badge variant="secondary" className="font-mono">${product.price}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <Button className="w-full bg-slate-900 hover:bg-slate-800" disabled={product.stock <= 0}>
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateProduct();
  
  const formSchema = insertProductSchema.extend({
    price: z.coerce.number(), // Input returns string, we need number for schema validation (or coerce string in hook)
    stock: z.coerce.number(),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Ray-Ban Aviator" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input {...register("brand")} placeholder="Ray-Ban" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>Category</Label>
              <select {...register("category")} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                {Object.values(PRODUCT_CATEGORIES).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
             <div className="space-y-2">
              <Label>Model</Label>
              <Input {...register("model")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input type="number" step="0.01" {...register("price")} />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" {...register("stock")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input {...register("description")} />
          </div>

           <div className="space-y-2">
            <Label>Image URL</Label>
            <Input {...register("imageUrl")} placeholder="https://..." />
          </div>

          <Button type="submit" className="w-full bg-primary" disabled={isPending}>
            {isPending ? "Creating..." : "Create Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
