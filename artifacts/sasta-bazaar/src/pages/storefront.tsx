import { useState } from "react"
import { useListProducts, useListCategories } from "@workspace/api-client-react"
import { useCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Euro, Tag, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const categoryGroups = [
  {
    name: "Deals",
    items: ["£5 & Under", "£10 & Under", "£20 & Under", "Multibuy", "Bulk Buys", "Last Chance Clearance"],
  },
  {
    name: "Home & Living",
    items: ["Bedroom", "Bathroom", "Storage", "Rugs"],
  },
  {
    name: "Kitchen & Dining",
    items: ["Cookware", "Appliances", "Food Storage", "Glassware", "Accessories"],
  },
  {
    name: "Gifts",
    items: ["For Her", "For Him", "For the Home"],
  },
  {
    name: "Household",
    items: ["Cleaning", "Paper Products", "Essentials"],
  },
  {
    name: "Garden & Outdoor",
    items: ["Furniture", "Accessories", "Camping"],
  },
  {
    name: "Clothing & Accessories",
    items: ["Socks", "Workwear", "Men's", "Women's"],
  },
  {
    name: "Beauty & Electricals",
    items: ["Fragrances", "Personal Care", "Audio", "Tools"],
  },
] as const

function ProductCarousel({
  title,
  eyebrow,
  products,
  onAdd,
  onViewAll,
}: {
  title: string
  eyebrow: string
  products: any[]
  onAdd: (product: any) => void
  onViewAll: () => void
}) {
  if (products.length === 0) return null

  return (
    <section className="space-y-4" aria-label={title}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
          <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight">{title}</h2>
        </div>
        <Button variant="ghost" size="sm" className="font-bold text-primary" onClick={onViewAll}>
          View all
        </Button>
      </div>

      <div className="relative px-1">
        <Carousel opts={{ align: "start", loop: products.length > 4 }} className="w-full">
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem key={`${title}-${product.id}`} className="pl-4 basis-[82%] sm:basis-1/2 lg:basis-1/4">
                <article className="h-full overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="relative aspect-[1.15] overflow-hidden bg-muted">
                    {product.badge && (
                      <Badge variant="accent" className="absolute right-3 top-3 z-10 text-xs">
                        {product.badge}
                      </Badge>
                    )}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="flex min-h-[168px] flex-col p-4">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {product.category}
                    </p>
                    <h3 className="line-clamp-2 flex-1 text-sm font-bold leading-snug">{product.name}</h3>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="flex items-center font-display text-xl font-black text-primary">
                        <Euro className="mr-0.5 h-4 w-4" />
                        {product.price.toFixed(2)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-xs font-bold text-muted-foreground line-through">
                          €{product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button size="sm" className="mt-3 w-full font-bold" onClick={() => onAdd(product)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to cart
                    </Button>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 hidden sm:flex" />
          <CarouselNext className="-right-3 hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  )
}

export default function Storefront() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("")
  const [menuFilter] = useState(() => new URLSearchParams(window.location.search).get("menu") ?? "")
  
  const { data: products, isLoading } = useListProducts(
    { search: search || undefined, category: category || undefined },
    { query: { queryKey: ["/api/products", search, category] } }
  )
  
  const { data: categories = [] } = useListCategories({ query: { queryKey: ["/api/categories"] } })
  const { addToCart } = useCart()
  const { toast } = useToast()
  const visibleProducts = products?.filter((product) => {
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
      bedroom: ["Bedroom"],
      pillows: ["Pillows"],
      duvet: ["Duvet Covers & Bed Sets"],
      sheets: ["Sheets"],
      bathroom: ["Bathroom"],
      towels: ["Towels", "Bathroom"],
      bathrobes: ["Bathrobes"],
      storage: ["Storage", "Food Storage"],
      cookware: ["Cookware"],
      appliances: ["Appliances"],
      "food-storage": ["Food Storage"],
      glassware: ["Glassware & Drinkware"],
      "kitchen-accessories": ["Kitchen Accessories", "Accessories"],
      kitchen: ["Accessories", "Food Storage"],
      "gifts-for-her": ["Gifts for Her"],
      "gifts-for-him": ["Gifts for Him"],
      "home-gifts": ["For the Home", "Home Gifts"],
      "gift-sets": ["Gift Sets"],
      gifts: ["For the Home"],
      cleaning: ["Cleaning"],
      "paper-products": ["Paper Products"],
      "bin-bags": ["Bin Bags"],
      "household-essentials": ["Essentials", "Household Essentials"],
      household: ["Cleaning", "Paper Products", "Essentials"],
      "garden-furniture": ["Furniture", "Garden Furniture"],
      "garden-accessories": ["Accessories", "Garden Accessories"],
      "camping-outdoor": ["Camping", "Camping & Outdoor"],
      garden: ["Furniture", "Accessories", "Camping"],
    }
    return departmentCategories[menuFilter]?.includes(product.category) ?? true
  })

  const handleAddToCart = (product: any) => {
    addToCart(product)
    toast({
      title: "Added to Cart!",
      description: `${product.name} is ready for checkout.`,
      duration: 2000,
    })
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-10 space-y-8">
      {/* Hero Banner */}
      <section className="bg-card border border-border p-8 md:p-12 rounded-2xl flex flex-col items-center text-center">
        <p className="text-xs font-bold tracking-[0.22em] uppercase text-primary mb-3">Everyday clearance</p>
        <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight mb-4 text-foreground">
          Great finds. Less spend.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl">
          Useful products, limited-time reductions, and new clearance lines added regularly.
        </p>
      </section>

      <section id="departments" className="bg-card rounded-2xl border border-border p-5 md:p-6 scroll-mt-32">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Shop by department</p>
            <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight">Find your next bargain</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCategory("")}>View all</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categoryGroups.map((group) => (
            <div key={group.name} className="space-y-2">
              <h3 className="font-bold text-sm text-foreground">{group.name}</h3>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <button
                    key={`${group.name}-${item}`}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`text-left text-xs font-bold transition-colors hover:text-primary ${
                      category === item ? "text-primary underline underline-offset-4" : "text-muted-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border">
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

      {!isLoading && visibleProducts && visibleProducts.length > 0 && (
        <div className="space-y-10">
          <ProductCarousel
            eyebrow="Deal of the day"
            title="Everything Under €10"
            products={visibleProducts.filter((product) => product.price <= 10)}
            onAdd={handleAddToCart}
            onViewAll={() => document.getElementById("all-products")?.scrollIntoView({ behavior: "smooth" })}
          />
          <ProductCarousel
            eyebrow="Picked for you"
            title="Customer Favourites"
            products={visibleProducts.filter((product) => product.featured)}
            onAdd={handleAddToCart}
            onViewAll={() => document.getElementById("all-products")?.scrollIntoView({ behavior: "smooth" })}
          />
          <ProductCarousel
            eyebrow="Moving fast"
            title="Last Chance Clearance"
            products={visibleProducts.filter(
              (product) =>
                product.badge === "Last Chance" ||
                (product.compareAtPrice != null && product.compareAtPrice > product.price),
            )}
            onAdd={handleAddToCart}
            onViewAll={() => document.getElementById("all-products")?.scrollIntoView({ behavior: "smooth" })}
          />
        </div>
      )}

      {/* Product Grid */}
      {isLoading ? (
        <div id="all-products" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 scroll-mt-24">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : visibleProducts?.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-border">
          <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-2xl font-bold">No items found</h2>
          <p className="text-muted-foreground mt-2">Try searching for something else.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleProducts?.map(product => (
            <div key={product.id} className="bg-card rounded-2xl p-4 flex flex-col border border-border group hover:shadow-lg transition-shadow duration-300">
              <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-muted">
                {product.badge && (
                  <Badge variant="accent" className="absolute top-2 right-2 z-10 px-2 py-1 text-xs">
                    {product.badge}
                  </Badge>
                )}
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
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
                    <Euro className="h-5 w-5 mr-0.5" />
                    {product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm font-bold text-muted-foreground line-through flex items-center mb-1">
                      €{product.compareAtPrice.toFixed(2)}
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
