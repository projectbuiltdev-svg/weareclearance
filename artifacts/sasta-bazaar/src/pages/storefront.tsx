import { useState } from "react"
import { useListProducts, useListCategories } from "@workspace/api-client-react"
import { useCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Tag, ShoppingCart, ArrowRight } from "lucide-react"
import { useCurrency } from "@/lib/currency"
import { useToast } from "@/hooks/use-toast"
import { staticCategories, staticProducts } from "@/data/static-products"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import heroImage from "@/assets/retail-hero.jpg"

const categoryGroups = [
  {
    name: "Shop by Price",
    items: ["Under £5", "Under £10", "Under £20", "Last Chance Clearance"],
  },
  {
    name: "Home & Living",
    items: ["Bedroom", "Bathroom", "Storage", "Household Essentials"],
  },
  {
    name: "Kitchen & Dining",
    items: ["Cookware", "Appliances", "Glassware & Drinkware", "Kitchen Accessories"],
  },
  {
    name: "Gifts & Seasonal",
    items: ["Gifts for Her", "Gifts for Him", "Gift Sets", "Garden & Outdoor"],
  }
] as const

function ProductCarousel({
  title,
  products,
  onAdd,
  onViewAll,
}: {
  title: string
  products: any[]
  onAdd: (product: any) => void
  onViewAll: () => void
}) {
  const { formatPrice } = useCurrency()
  if (products.length === 0) return null

  return (
    <section className="space-y-6" aria-label={title}>
      <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">{title}</h2>
        <Button variant="link" size="sm" className="font-semibold text-primary hover:text-primary/80 px-0" onClick={onViewAll}>
          View all <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        <Carousel opts={{ align: "start", loop: false }} className="w-full">
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem key={`${title}-${product.id}`} className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <article className="retail-card group h-full flex flex-col relative">
                  {product.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-accent text-accent-foreground font-bold tracking-wide rounded-sm px-2 py-0.5 pointer-events-none">
                        {product.badge}
                      </Badge>
                    </div>
                  )}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center p-4">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="font-display font-bold text-4xl text-muted-foreground/30">No Image</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      {product.category}
                    </p>
                    <h3 className="line-clamp-2 text-sm sm:text-base font-semibold leading-snug mb-3 flex-1">
                      {product.name}
                    </h3>
                    <div className="flex items-end justify-between mt-auto">
                      <div>
                        <span className="font-display text-xl font-bold text-foreground block">
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-xs font-medium text-muted-foreground line-through block mt-0.5">
                            RRP {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      <Button size="icon" className="h-10 w-10 rounded-full bg-black hover:bg-primary text-white transition-colors" onClick={() => onAdd(product)}>
                        <ShoppingCart className="h-4 w-4" />
                        <span className="sr-only">Add to cart</span>
                      </Button>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-5 bg-white border-border shadow-sm hover:bg-muted" />
          <CarouselNext className="hidden md:flex -right-5 bg-white border-border shadow-sm hover:bg-muted" />
        </Carousel>
      </div>
    </section>
  )
}

export default function Storefront() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("")
  const [menuFilter, setMenuFilter] = useState(() => new URLSearchParams(window.location.search).get("menu") ?? "")
  
  const { data: apiProducts } = useListProducts(
    { search: search || undefined, category: category || undefined },
    { query: { queryKey: ["/api/products", search, category] } }
  )
  
  const { data: apiCategories } = useListCategories({ query: { queryKey: ["/api/categories"] } })
  const { addToCart } = useCart()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()
  
  const products = Array.isArray(apiProducts) ? apiProducts : staticProducts.filter((product) => {
    const matchesSearch = !search || `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !category || product.category === category
    return matchesSearch && matchesCategory
  })
  
  const categories = Array.isArray(apiCategories) && apiCategories.length ? apiCategories : staticCategories
  
  const visibleProducts = products.filter((product) => {
    if (!menuFilter) return true
    if (menuFilter === "under-5") return product.price <= 5
    if (menuFilter === "under-10") return product.price <= 10
    if (menuFilter === "under-20") return product.price <= 20
    if (menuFilter === "deals" || menuFilter === "multibuy" || menuFilter === "bulk") {
      return product.compareAtPrice != null && product.compareAtPrice > product.price
    }
    if (menuFilter === "last-chance") {
      return product.badge === "Last Chance" || (product.compareAtPrice != null && product.compareAtPrice > product.price)
    }
    const departmentCategories: Record<string, string[]> = {
      bedroom: ["Bedroom", "Duvet Covers & Bed Sets", "Pillows", "Sheets"],
      cookware: ["Cookware", "Appliances", "Glassware & Drinkware", "Kitchen Accessories", "Food Storage"],
      "gifts-for-her": ["Gifts for Her", "Gifts for Him", "Home Gifts", "Gift Sets"],
    }
    return departmentCategories[menuFilter]?.includes(product.category) ?? true
  })

  const handleAddToCart = (product: any) => {
    addToCart(product)
    toast({
      title: "Added to Basket",
      description: `${product.name} has been added to your basket.`,
    })
  }

  const handleFilterClick = (filter: string) => {
    setCategory("")
    setSearch("")
    
    // Map UI names back to logic
    if (filter === "Under £5") setMenuFilter("under-5")
    else if (filter === "Under £10") setMenuFilter("under-10")
    else if (filter === "Under £20") setMenuFilter("under-20")
    else if (filter === "Last Chance Clearance") setMenuFilter("last-chance")
    else if (filter === "All") setMenuFilter("")
    else {
      setMenuFilter("")
      setCategory(filter)
    }
    
    document.getElementById("all-products")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 space-y-12 md:space-y-16">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-muted h-[400px] md:h-[500px] flex items-center shadow-sm">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Modern Minimal Retail" 
            className="w-full h-full object-cover object-center opacity-90"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent dark:from-black/90 dark:to-black/20" />
        </div>
        <div className="relative z-10 px-8 md:px-16 max-w-2xl text-white">
          <Badge className="bg-primary hover:bg-primary text-white font-bold tracking-wider rounded-sm px-3 py-1 mb-6 border-none">
            EVERYDAY CLEARANCE
          </Badge>
          <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-[1.1] mb-6">
            Sharp prices.<br />Premium finds.
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium mb-8 max-w-md">
            Curated clearance items for every room in your home. Quality you can trust, prices you can't ignore.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-bold px-8 h-12" onClick={() => handleFilterClick('All')}>
              Shop All Deals
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white font-bold px-8 h-12 bg-transparent" onClick={() => handleFilterClick('Last Chance Clearance')}>
              Last Chance
            </Button>
          </div>
        </div>
      </section>

      {/* Directory / Categories */}
      <section className="bg-white rounded-2xl border border-border p-6 md:p-8 shadow-sm">
        <h2 className="font-display font-bold text-lg mb-6 uppercase tracking-wider text-muted-foreground border-b border-border pb-4">
          Shop by Department
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categoryGroups.map((group) => (
            <div key={group.name} className="space-y-4">
              <h3 className="font-bold text-base text-foreground">{group.name}</h3>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={`${group.name}-${item}`}>
                    <button
                      type="button"
                      onClick={() => handleFilterClick(item)}
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Carousels */}
      {visibleProducts.length > 0 && (
        <div className="space-y-16">
          <ProductCarousel
            title="Customer Favourites"
            products={visibleProducts.filter((product) => product.featured)}
            onAdd={handleAddToCart}
            onViewAll={() => handleFilterClick("All")}
          />
          <ProductCarousel
            title="Deals Under £10"
            products={visibleProducts.filter((product) => product.price <= 10)}
            onAdd={handleAddToCart}
            onViewAll={() => handleFilterClick("Under £10")}
          />
        </div>
      )}

      {/* Main Grid Header & Filters */}
      <div id="all-products" className="scroll-mt-32 border-t border-border pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="font-display font-bold text-3xl mb-2">All Products</h2>
            <p className="text-muted-foreground font-medium">
              {visibleProducts.length} {visibleProducts.length === 1 ? "item" : "items"} available
            </p>
          </div>
          
          <div className="flex items-center w-full md:w-auto gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 h-11 bg-muted/50 border-transparent focus-visible:border-primary focus-visible:ring-0 rounded-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {visibleProducts.length === 0 ? (
          <div className="text-center py-32 bg-muted/30 rounded-2xl border border-border border-dashed">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold mb-2">No items found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
            <Button variant="outline" className="mt-6 font-semibold" onClick={() => handleFilterClick("All")}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {visibleProducts.map(product => (
              <article key={product.id} className="retail-card group flex flex-col relative animate-slide-down">
                {product.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-accent text-accent-foreground font-bold tracking-wide rounded-sm px-2 py-0.5 pointer-events-none">
                      {product.badge}
                    </Badge>
                  </div>
                )}
                <div className="relative aspect-[4/3] bg-muted overflow-hidden flex items-center justify-center p-4">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-display font-bold text-4xl">
                      {product.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col p-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-base leading-snug mb-4 line-clamp-2 flex-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-border/50">
                    <div>
                      <span className="font-display font-bold text-xl block">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-xs font-medium text-muted-foreground line-through block mt-1">
                          RRP {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className={`h-10 w-10 rounded-full transition-colors ${product.inventory === 0 ? "bg-muted text-muted-foreground pointer-events-none" : "bg-black hover:bg-primary text-white"}`}
                      size="icon"
                      disabled={product.inventory === 0}
                      title={product.inventory === 0 ? "Out of Stock" : "Add to Basket"}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
