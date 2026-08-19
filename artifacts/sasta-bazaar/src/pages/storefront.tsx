import { useState } from "react"
import { useListProducts, useListCategories } from "@workspace/api-client-react"
import { useCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, IndianRupee, Tag, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Storefront() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("")
  
  const { data: products, isLoading } = useListProducts(
    { search: search || undefined, category: category || undefined },
    { query: { queryKey: ["/api/products", search, category] } }
  )
  
  const { data: categories = [] } = useListCategories({ query: { queryKey: ["/api/categories"] } })
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: any) => {
    addToCart(product)
    toast({
      title: "Added to Cart!",
      description: `${product.name} is ready for checkout.`,
      duration: 2000,
    })
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Banner */}
      <section className="bg-secondary text-secondary-foreground p-8 md:p-12 rounded-xl bazaar-border-secondary relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-300/40 to-transparent pointer-events-none" />
        <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter mb-4 z-10 text-primary drop-shadow-[2px_2px_0_#fff]">
          Maha Bachat Dhamaka!
        </h1>
        <p className="text-lg md:text-xl font-bold max-w-2xl z-10">
          Everyday low prices on all your daily needs. Loot lo before stock runs out!
        </p>
      </section>

      {/* Filters */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg bazaar-border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search for atta, dal, sabun..." 
            className="pl-10 text-base font-medium h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button 
            variant={category === "" ? "default" : "outline"} 
            size="sm"
            onClick={() => setCategory("")}
            className="rounded-full"
          >
            All Items
          </Button>
          {categories.map(c => (
            <Button 
              key={c}
              variant={category === c ? "default" : "outline"} 
              size="sm"
              onClick={() => setCategory(c)}
              className="rounded-full"
            >
              {c}
            </Button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg bazaar-border" />
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-lg bazaar-border">
          <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold">No items found</h2>
          <p className="text-muted-foreground mt-2">Try searching for something else.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map(product => (
            <div key={product.id} className="bg-card rounded-xl p-4 flex flex-col bazaar-border group hover:-translate-y-1 transition-transform duration-300">
              <div className="relative aspect-square mb-4 rounded-md overflow-hidden bg-muted">
                {product.badge && (
                  <Badge variant="accent" className="absolute top-2 right-2 z-10 px-2 py-1 text-sm shadow-[2px_2px_0_#000]">
                    {product.badge}
                  </Badge>
                )}
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground font-display font-bold text-4xl">
                    {product.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  {product.category}
                </div>
                <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 flex-1">
                  {product.name}
                </h3>
                
                <div className="flex items-end gap-2 mb-4">
                  <span className="font-display font-black text-2xl text-primary flex items-center">
                    <IndianRupee className="h-5 w-5 mr-0.5" />
                    {product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm font-bold text-muted-foreground line-through flex items-center mb-1">
                      ₹{product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <Button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full font-bold group-active:scale-95"
                  disabled={product.inventory === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.inventory === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
