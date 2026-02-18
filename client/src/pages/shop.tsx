import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ShoppingBag, Tag } from "lucide-react";
import { useState } from "react";
import { PRODUCT_CATEGORIES } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function Shop() {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory ? product.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Tienda de Lentes</h1>
          <p className="text-muted-foreground">Encuentra los armazones perfectos para ti.</p>
        </div>
        
        <div className="w-full md:w-auto flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              className="pl-9 rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button 
          variant={filterCategory === null ? "default" : "outline"} 
          onClick={() => setFilterCategory(null)}
          className="rounded-full"
        >
          Todos
        </Button>
        {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => (
          <Button
            key={key}
            variant={filterCategory === label ? "default" : "outline"}
            onClick={() => setFilterCategory(label)}
            className="rounded-full capitalize"
          >
            {label.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts?.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/60">
              <div className="aspect-[4/3] bg-muted/20 relative overflow-hidden">
                <img 
                  src={product.imageUrl || "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80"} 
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-3 left-3 bg-white/90 text-black hover:bg-white backdrop-blur-sm">
                  {product.brand}
                </Badge>
              </div>
              <CardHeader className="p-5 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
                    <p className="text-xs text-muted-foreground capitalize mt-1">{product.category.replace('_', ' ')}</p>
                  </div>
                  <span className="font-bold text-primary text-lg">${Number(product.price).toLocaleString('es-CL')}</span>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <Button className="w-full gap-2 group-hover:bg-primary/90">
                  <ShoppingBag className="w-4 h-4" /> Añadir al Carrito
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {filteredProducts?.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No se encontraron productos.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
