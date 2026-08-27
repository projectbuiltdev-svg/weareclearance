import { useEffect, useState } from "react"
import { Link, useLocation } from "wouter"
import { useListProducts, useListCategories } from "@workspace/api-client-react"
import { useCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Tag,
  ShoppingBag,
  ArrowRight,
  Star,
  BadgePercent,
  House,
  CookingPot,
  Gift,
  Clock3,
  ChevronDown,
} from "lucide-react"
import { useCurrency } from "@/lib/currency"
import { useToast } from "@/hooks/use-toast"
import { staticCategories, staticProducts } from "@/data/static-products"
import { FcGoogle } from "react-icons/fc"
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
    name: "Curated Edits",
    items: ["Under £5", "Under £10", "Under £20", "Last Chance Clearance"],
  },
  {
    name: "Home & Sanctuary",
    items: ["Bedroom", "Bathroom", "Storage", "Household Essentials"],
  },
  {
    name: "Kitchen & Dining",
    items: ["Cookware", "Appliances", "Glassware & Drinkware", "Kitchen Accessories"],
  },
  {
    name: "Gifting & Seasonal",
    items: ["Gifts for Her", "Gifts for Him", "Gift Sets", "Garden & Outdoor"],
  }
] as const

function ProductCarousel({
  title,
  products,
  onAdd,
  viewAllHref,
}: {
  title: string
  products: any[]
  onAdd: (product: any) => void
  viewAllHref: string
}) {
  const { formatPrice } = useCurrency()
  if (products.length === 0) return null

  return (
    <section className="space-y-8" aria-label={title}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
        <h2 className="font-display text-3xl md:text-4xl text-foreground italic">{title}</h2>
        <Button asChild variant="link" className="h-auto px-0 pb-1 text-xs font-semibold uppercase tracking-widest text-primary hover:text-primary/80">
          <a href={viewAllHref}>
            Discover Collection <ArrowRight className="ml-2 h-3 w-3" />
          </a>
        </Button>
      </div>

      <div className="relative">
        <Carousel opts={{ align: "start", loop: false }} className="w-full">
          <CarouselContent className="-ml-6">
            {products.map((product) => (
              <CarouselItem key={`${title}-${product.id}`} className="pl-6 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <article className="retail-card group h-full flex flex-col relative bg-white pb-5">
                  {product.badge && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="pointer-events-none rounded-none border border-blue-200/80 bg-white/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-950 shadow-[0_8px_24px_-12px_rgba(30,64,175,0.55)] backdrop-blur-md before:mr-2 before:h-1.5 before:w-1.5 before:rotate-45 before:bg-blue-600 before:content-['']">
                        {product.badge}
                      </Badge>
                    </div>
                  )}
                  <Link href={`/products/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-muted/30 flex items-center justify-center p-6 border-b border-border/50">
                    {product.imageUrl ? (
                      <>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none"
                          event.currentTarget.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                      <span className="hidden font-display text-4xl italic text-blue-700/25" aria-hidden="true">WAC</span>
                      </>
                    ) : (
                      <span className="font-display italic text-4xl text-muted-foreground/30">C</span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col px-5 pt-5 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      {product.category}
                    </p>
                    <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
                      <h3 className="line-clamp-2 text-sm md:text-base font-medium leading-relaxed">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="mt-2 mb-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.shortDescription}</p>
                    <div className="flex flex-col items-center justify-end mt-auto gap-4">
                      <div className="flex items-baseline gap-2 justify-center">
                        <span className="font-display text-xl text-foreground block">
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-xs font-medium text-muted-foreground line-through block mb-1">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full rounded-none border-foreground text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all uppercase tracking-widest text-[11px] h-10" 
                        onClick={() => onAdd(product)}
                      >
                        Add to Bag
                      </Button>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-6 bg-white border-border shadow-sm hover:bg-muted rounded-none" />
          <CarouselNext className="hidden md:flex -right-6 bg-white border-border shadow-sm hover:bg-muted rounded-none" />
        </Carousel>
      </div>
    </section>
  )
}

export default function Storefront() {
  const [location] = useLocation()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("")
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [menuFilter, setMenuFilter] = useState(() => {
    const collectionSlug = location.match(/^\/collections\/([^/?#]+)/)?.[1]
    if (collectionSlug) return collectionSlug
    return typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("menu") ?? ""
  })

  useEffect(() => {
    const collectionSlug = location.match(/^\/collections\/([^/?#]+)/)?.[1]
    setMenuFilter(collectionSlug ?? new URLSearchParams(window.location.search).get("menu") ?? "")
    setCategory("")
    setSearch("")
  }, [location])
  
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
    if (menuFilter === "deals") {
      return product.price <= 10 || (product.compareAtPrice != null && product.compareAtPrice > product.price)
    }
    if (menuFilter === "multibuy" || menuFilter === "bulk") {
      return product.compareAtPrice != null && product.compareAtPrice > product.price
    }
    if (menuFilter === "last-chance") {
      return product.badge === "Last Chance" || (product.compareAtPrice != null && product.compareAtPrice > product.price)
    }
    const departmentCategories: Record<string, string[]> = {
      "home-living": ["Bedroom", "Pillows", "Duvet Covers & Bed Sets", "Sheets", "Bathroom", "Towels", "Bathrobes", "Storage", "Household Essentials", "For the Home"],
      "kitchen-dining": ["Cookware", "Appliances", "Food Storage", "Glassware & Drinkware", "Kitchen Accessories"],
      gifts: ["Gifts for Her", "Gifts for Him", "Home Gifts", "Gift Sets"],
      bedroom: ["Bedroom"],
      pillows: ["Pillows"],
      duvet: ["Duvet Covers & Bed Sets"],
      sheets: ["Sheets"],
      bathroom: ["Bathroom"],
      towels: ["Towels"],
      bathrobes: ["Bathrobes"],
      storage: ["Storage"],
      cookware: ["Cookware"],
      appliances: ["Appliances"],
      "food-storage": ["Food Storage"],
      glassware: ["Glassware & Drinkware"],
      "kitchen-accessories": ["Kitchen Accessories"],
      "gifts-for-her": ["Gifts for Her"],
      "gifts-for-him": ["Gifts for Him"],
      "home-gifts": ["Home Gifts"],
      "gift-sets": ["Gift Sets"],
      cleaning: ["Cleaning"],
      "paper-products": ["Paper Products"],
      "bin-bags": ["Bin Bags"],
      "household-essentials": ["Household Essentials"],
      "garden-furniture": ["Garden Furniture"],
      "garden-accessories": ["Garden Accessories"],
      "camping-outdoor": ["Camping & Outdoor"],
    }
    return departmentCategories[menuFilter]?.includes(product.category) ?? true
  })

  const handleAddToCart = (product: any) => {
    addToCart(product)
    toast({
      title: "Added to Bag",
      description: `${product.name} has been added to your bag.`,
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
    <main className="container mx-auto flex flex-col gap-20 px-4 py-8 md:gap-28 md:py-16">
      
      {/* Hero Banner */}
      <section className="order-1 relative flex min-h-[680px] items-center overflow-hidden border border-border bg-white sm:min-h-[580px] md:min-h-[600px]">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="European Department Store" 
            className="h-full w-full object-cover object-[68%_center] sm:object-[60%_center] md:object-[center_30%]"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/35 via-slate-900/10 to-transparent" />
        </div>
        
        <div className="relative z-10 mx-4 max-w-2xl border border-white/50 bg-slate-950/10 p-6 text-white shadow-[0_24px_70px_-30px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-sm sm:mx-8 sm:bg-slate-950/[0.08] sm:p-8 md:mx-12 md:p-12 lg:mx-20 lg:p-14">
          <p className="text-sm md:text-sm font-semibold uppercase tracking-[0.3em] mb-6 text-white/90">
            We Are Clearance
          </p>
          <h1 className="font-display mb-6 text-4xl leading-[1.03] !text-white sm:text-5xl md:mb-8 md:text-7xl">
            Elevated living,<br />
            <span className="font-light italic !text-white">accessible elegance.</span>
          </h1>
          <p className="mb-8 max-w-lg text-base font-light leading-relaxed text-white/90 sm:text-lg md:mb-10">
            Discover our curated collection of premium home, kitchen, and lifestyle essentials. Distinctive design without the typical premium price tag.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-5">
            <Button asChild size="lg" className="h-13 w-full rounded-none bg-white px-7 text-xs font-semibold uppercase tracking-widest text-black hover:bg-gray-100 sm:h-14 sm:w-auto sm:px-10">
              <a href="/?#all-products">Explore Collection</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-13 w-full rounded-none border-white/60 bg-white/5 px-7 text-xs font-semibold uppercase tracking-widest text-white hover:bg-white/15 hover:text-white sm:h-14 sm:w-auto sm:px-10">
              <a href="/collections/last-chance">The Archive</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Product-first department sections */}
      <div id="all-products" className="order-2 scroll-mt-32 space-y-24">
        <ProductCarousel
          title="Deals"
          products={visibleProducts.filter(
            (product) =>
              product.price <= 10 ||
              (product.compareAtPrice != null && product.compareAtPrice > product.price),
          )}
          onAdd={handleAddToCart}
          viewAllHref="/collections/deals"
        />

        <ProductCarousel
          title="Last Chance to Buy"
          products={visibleProducts.filter(
            (product) =>
              product.badge === "Last Chance" ||
              (product.compareAtPrice != null && product.compareAtPrice > product.price),
          )}
          onAdd={handleAddToCart}
          viewAllHref="/collections/last-chance"
        />

        <ProductCarousel
          title="Home & Living"
          products={visibleProducts.filter((product) =>
            [
              "Bedroom",
              "Pillows",
              "Duvet Covers & Bed Sets",
              "Sheets",
              "Bathroom",
              "Towels",
              "Bathrobes",
              "Storage",
              "Household Essentials",
              "For the Home",
            ].includes(product.category),
          )}
          onAdd={handleAddToCart}
          viewAllHref="/collections/home-living"
        />

        <ProductCarousel
          title="Kitchen & Dining"
          products={visibleProducts.filter((product) =>
            [
              "Cookware",
              "Appliances",
              "Food Storage",
              "Glassware & Drinkware",
              "Kitchen Accessories",
            ].includes(product.category),
          )}
          onAdd={handleAddToCart}
          viewAllHref="/collections/kitchen-dining"
        />

        <ProductCarousel
          title="Gifts"
          products={visibleProducts.filter((product) =>
            ["Gifts for Her", "Gifts for Him", "Home Gifts", "Gift Sets"].includes(product.category),
          )}
          onAdd={handleAddToCart}
          viewAllHref="/collections/gifts"
        />

        <div className="mx-auto max-w-2xl border-y border-border py-8">
          <label htmlFor="collection-search" className="mb-3 block text-center text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">
            Search all collections
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="collection-search"
              placeholder="What are you looking for?"
              className="h-14 rounded-none border-border bg-white pl-12 text-sm focus-visible:border-blue-700 focus-visible:ring-blue-700/20"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Featured category row */}
      <section aria-label="Featured shopping categories" className="order-3 border-y border-border bg-white">
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-5">
          {[
            {
              Icon: BadgePercent,
              title: "Deals",
              subtitle: "Accessible Luxuries Under £10",
              image: products.find((product) => product.price <= 10)?.imageUrl,
            },
            {
              Icon: House,
              title: "Home & Living",
              image: products.find((product) => ["Bedroom", "Bathroom", "Storage", "Household Essentials", "For the Home"].includes(product.category))?.imageUrl,
            },
            {
              Icon: CookingPot,
              title: "Kitchen & Dining",
              image: products.find((product) => ["Cookware", "Appliances", "Food Storage", "Glassware & Drinkware", "Kitchen Accessories"].includes(product.category))?.imageUrl,
            },
            {
              Icon: Gift,
              title: "Gifts",
              image: products.find((product) => ["Gifts for Her", "Gifts for Him", "Home Gifts", "Gift Sets"].includes(product.category))?.imageUrl,
            },
            {
              Icon: Clock3,
              title: "Last Chance",
              image: products.find((product) => product.badge === "Last Chance" || (product.compareAtPrice != null && product.compareAtPrice > product.price))?.imageUrl,
            },
          ].map((item) => (
            <a
              key={item.title}
              href={`/collections/${item.title === "Home & Living" ? "home-living" : item.title === "Kitchen & Dining" ? "kitchen-dining" : item.title === "Last Chance" ? "last-chance" : item.title.toLowerCase()}`}
              className="group relative flex min-h-72 flex-col overflow-hidden bg-white transition-colors duration-300 hover:bg-blue-700"
            >
              <div className="relative h-40 overflow-hidden bg-muted/30">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-50 to-slate-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" />
                <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center border border-white/70 bg-white/90 text-blue-700 shadow-sm backdrop-blur-sm">
                  <item.Icon className="h-5 w-5 stroke-[1.5]" />
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-end px-6 py-6">
                <h2 className="font-display text-2xl leading-tight text-foreground transition-colors group-hover:text-white">
                  {item.title}
                </h2>
                {item.subtitle && (
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors group-hover:text-white/75">
                    {item.subtitle}
                  </p>
                )}
              </div>
              <span className="absolute bottom-0 left-0 h-1 w-0 bg-white transition-all duration-500 group-hover:w-full" />
            </a>
          ))}
        </div>
      </section>

      {/* Google-style testimonial row */}
      <section className="order-5 border border-border bg-[#fbfaf7] px-6 py-8 md:px-10">
        <div className="mb-7 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-blue-700">Customer notes</p>
            <h2 className="font-display text-3xl text-foreground">Loved by discerning shoppers</h2>
          </div>
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-1 sm:justify-end">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-[#f4b400] text-[#f4b400]" />
              ))}
            </div>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">Sample Google-style testimonials</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:divide-x md:divide-border">
          {[
            {
              quote: "Beautiful quality for the price. The parcel arrived quickly and everything felt far more premium than expected.",
              name: "Sophie M.",
              detail: "Home & Living customer",
            },
            {
              quote: "A genuinely well-curated range. I found elegant kitchen pieces without paying department-store prices.",
              name: "Daniel R.",
              detail: "Kitchen & Dining customer",
            },
            {
              quote: "Easy ordering, clear updates and lovely products. I have already recommended the store to family.",
              name: "Aisling K.",
              detail: "Returning customer",
            },
          ].map((review) => (
            <article key={review.name} className="md:px-8 first:md:pl-0 last:md:pr-0">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-[#f4b400] text-[#f4b400]" />
                  ))}
                </div>
                <FcGoogle className="h-5 w-5" aria-label="Google" />
              </div>
              <blockquote className="font-display text-xl italic leading-relaxed text-foreground">
                “{review.quote}”
              </blockquote>
              <footer className="mt-6">
                <p className="text-sm font-bold text-foreground">{review.name}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {review.detail}
                </p>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="order-6 border-t border-border bg-muted/20">
        <div className="container mx-auto px-4 py-16 md:px-8 md:py-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-700">Shopping with us</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Clearance shopping questions</h2>
          </div>
          <div className="grid items-start gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {[
              ["What products does We Are Clearance sell?", "We Are Clearance sells clearance homeware, kitchen and dining essentials, affordable gifts, accessories and everyday household products."],
              ["Do you deliver across the UK and Ireland?", "Yes. We Are Clearance serves customers across the United Kingdom and Ireland, with delivery information confirmed during checkout."],
              ["Are the original and sale prices shown clearly?", "Yes. Discounted products show the current sale price beside the struck-through original price, along with the calculated percentage saving."],
              ["Can clearance products sell out?", "Yes. Clearance quantities are limited and product pages display current stock availability, so popular items may sell out quickly."],
              ["How do I find a specific clearance product?", "Use the search and collection filters to browse by product name, category, price range or department, then open a product card for full details."],
              ["Are clearance products new?", "Yes. Our clearance range consists of new products offered at reduced prices, unless a product page clearly states otherwise."],
              ["Can I change or cancel my order?", "Contact us as soon as possible after placing your order. We will try to help before the parcel enters fulfilment, but changes cannot be guaranteed."],
              ["What payment methods can I use?", "Payment options are shown securely during checkout. Your order is only confirmed after the checkout process has completed successfully."],
              ["How can I check product availability?", "Each product page shows its current stock status. Limited clearance quantities can change quickly as orders are completed."],
              ["Do sale prices include the discount saving?", "Yes. Where an original price is available, the product page shows the sale price, the original price and the calculated percentage saving."],
              ["How do I contact We Are Clearance?", "Use the customer service details provided on the store or contact page and include your order number when asking about an existing purchase."],
              ["Why do clearance quantities vary?", "Clearance stock is sourced in limited quantities, so availability varies by product and popular items may not be replenished once sold out."],
            ].map(([question, answer], index) => {
              const isOpen = openFaq === question
              return (
                <div key={question} className={`self-start bg-white px-4 py-3 transition-colors md:px-5 ${isOpen ? "bg-[#fbfaf7]" : "hover:bg-slate-50"}`}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => setOpenFaq(isOpen ? null : question)}
                    className="group/faq flex w-full items-center justify-between gap-4 text-left text-sm font-semibold leading-snug"
                  >
                    <span className={`transition-colors ${isOpen ? "text-blue-800" : "group-hover/faq:text-blue-800"}`}>{question}</span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center border transition-all ${
                        isOpen
                          ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                          : "border-blue-200 bg-blue-50/60 text-blue-700 group-hover/faq:border-blue-700 group-hover/faq:bg-blue-700 group-hover/faq:text-white"
                      }`}
                    >
                      <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </span>
                  </button>
                  {isOpen && (
                    <p id={`faq-answer-${index}`} className="mt-3 text-sm leading-6 text-muted-foreground">
                      {answer}
                    </p>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Directory / Categories */}
      <section className="hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="text-center mb-12">
          <h2 className="font-display italic text-3xl md:text-4xl mb-4">
            Department Directory
          </h2>
          <div className="w-12 h-px bg-primary mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12">
          {categoryGroups.map((group) => (
            <div key={group.name} className="space-y-6">
              <h3 className="font-sans font-semibold uppercase tracking-[0.15em] text-sm text-foreground border-b border-border/50 pb-3">
                {group.name}
              </h3>
              <ul className="space-y-4">
                {group.items.map((item) => (
                  <li key={`${group.name}-${item}`}>
                    <button
                      type="button"
                      onClick={() => handleFilterClick(item)}
                      className="text-sm font-normal text-muted-foreground hover:text-primary transition-colors text-left flex items-center group/btn"
                    >
                      <span className="w-0 overflow-hidden group-hover/btn:w-3 transition-all duration-300 ease-out opacity-0 group-hover/btn:opacity-100">—</span>
                      <span className="group-hover/btn:ml-1 transition-all duration-300">{item}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Carousels */}
      {false && visibleProducts.length > 0 && (
        <div className="space-y-24">
          <ProductCarousel
            title="Curator's Selection"
            products={visibleProducts.filter((product) => product.featured)}
            onAdd={handleAddToCart}
            viewAllHref="/?#all-products"
          />
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <ProductCarousel
            title="Accessible Luxuries Under £10"
            products={visibleProducts.filter((product) => product.price <= 10)}
            onAdd={handleAddToCart}
            viewAllHref="/collections/deals"
          />
        </div>
      )}

      {/* Main Grid Header & Filters */}
      <div className="hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-border pb-8">
          <div>
            <h2 className="font-display italic text-4xl mb-3">The Complete Collection</h2>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
              Showing {visibleProducts.length} {visibleProducts.length === 1 ? "item" : "items"}
            </p>
          </div>
          
          <div className="flex items-center w-full md:w-auto gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search collection..." 
                className="pl-12 h-12 bg-white border-border rounded-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {visibleProducts.length === 0 ? (
          <div className="text-center py-40 bg-white border border-border">
            <Tag className="h-10 w-10 mx-auto text-muted-foreground/30 mb-6" />
            <h3 className="font-display italic text-2xl mb-3">No pieces found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">We couldn't find any items matching your criteria. Explore our other departments.</p>
            <Button variant="outline" className="uppercase tracking-widest text-xs rounded-none h-12 px-8" onClick={() => handleFilterClick("All")}>
              Reset Selection
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-x-8 md:gap-y-12">
            {visibleProducts.map(product => (
              <article key={product.id} className="retail-card group flex flex-col relative bg-white animate-slide-down pb-5">
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="pointer-events-none rounded-none border border-blue-200/80 bg-white/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-950 shadow-[0_8px_24px_-12px_rgba(30,64,175,0.55)] backdrop-blur-md before:mr-2 before:h-1.5 before:w-1.5 before:rotate-45 before:bg-blue-600 before:content-['']">
                      {product.badge}
                    </Badge>
                  </div>
                )}
                <Link href={`/products/${product.slug}`} className="relative aspect-[4/5] bg-muted/30 overflow-hidden flex items-center justify-center p-6 border-b border-border/50">
                  {product.imageUrl ? (
                    <>
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" 
                      onError={(event) => {
                        event.currentTarget.style.display = "none"
                        event.currentTarget.nextElementSibling?.classList.remove("hidden")
                      }}
                    />
                    <span className="hidden font-display text-4xl italic text-blue-700/25" aria-hidden="true">WAC</span>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-display italic text-4xl">
                      C
                    </div>
                  )}
                  
                  {/* Quick Add Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex justify-center">
                    <Button 
                      onClick={(e) => {
                        e.preventDefault()
                        handleAddToCart(product)
                      }}
                      className={`w-full rounded-none uppercase tracking-widest text-[11px] h-10 shadow-lg ${product.inventory === 0 ? "bg-muted text-muted-foreground pointer-events-none" : "bg-primary hover:bg-primary/90 text-white"}`}
                      disabled={product.inventory === 0}
                    >
                      {product.inventory === 0 ? "Out of Stock" : "Quick Add"}
                    </Button>
                  </div>
                </Link>
                
                <div className="flex-1 flex flex-col px-5 pt-5 text-center">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-2">
                    {product.category}
                  </p>
                  <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
                    <h3 className="font-medium text-sm md:text-base leading-relaxed line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-2 mb-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.shortDescription}</p>
                  
                  <div className="flex items-baseline justify-center gap-2 mt-auto">
                    <span className="font-display text-xl block">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-xs font-medium text-muted-foreground line-through block">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
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
