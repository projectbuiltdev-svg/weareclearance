import { useEffect, useState } from "react"
import { useParams, Link } from "wouter"
import { useListProducts } from "@workspace/api-client-react"
import { useCart } from "@/lib/cart"
import { useCurrency } from "@/lib/currency"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, ChevronRight, Tag } from "lucide-react"

export default function ProductDetail() {
  const params = useParams<{ slug: string }>()
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()

  const { data: apiProducts, isLoading } = useListProducts(
    {}, 
    { query: { queryKey: ["/api/products"] } }
  )

  const products = Array.isArray(apiProducts) ? apiProducts : []
  const product = products.find(p => p.slug === params.slug)

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1)
  }, [product?.id])

  useEffect(() => {
    if (product) {
      const seoTitle = `${product.name} Clearance Deal | We Are Clearance`
      const seoDescription = `${product.shortDescription} Shop this ${product.category.toLowerCase()} clearance deal at We Are Clearance while stock lasts.`.slice(0, 160)
      document.title = seoTitle
      const meta = document.querySelector('meta[name="description"]')
      if (meta) {
        meta.setAttribute("content", seoDescription)
      } else {
        const newMeta = document.createElement('meta')
        newMeta.name = "description"
        newMeta.content = seoDescription
        document.head.appendChild(newMeta)
      }
      const canonicalUrl = `https://weareclearance.com/products/${product.slug}`
      const setMeta = (selector: string, attribute: "name" | "property", key: string, content: string) => {
        let element = document.querySelector<HTMLMetaElement>(selector)
        if (!element) {
          element = document.createElement("meta")
          element.setAttribute(attribute, key)
          document.head.appendChild(element)
        }
        element.content = content
      }
      setMeta('meta[property="og:title"]', "property", "og:title", seoTitle)
      setMeta('meta[property="og:description"]', "property", "og:description", seoDescription)
      setMeta('meta[property="og:type"]', "property", "og:type", "product")
      setMeta('meta[property="og:image"]', "property", "og:image", product.imageUrl)
      setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl)
      setMeta('meta[name="twitter:title"]', "name", "twitter:title", seoTitle)
      setMeta('meta[name="twitter:description"]', "name", "twitter:description", seoDescription)
      setMeta('meta[name="twitter:image"]', "name", "twitter:image", product.imageUrl)

      let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement("link")
        canonical.rel = "canonical"
        document.head.appendChild(canonical)
      }
      canonical.href = canonicalUrl

      const schemaId = "product-runtime-schema"
      document.getElementById(schemaId)?.remove()
      const schema = document.createElement("script")
      schema.id = schemaId
      schema.type = "application/ld+json"
      schema.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.longDescription || product.description,
        image: [product.imageUrl],
        sku: product.sku,
        category: product.category,
        brand: { "@type": "Brand", name: "We Are Clearance" },
        offers: {
          "@type": "Offer",
          url: canonicalUrl,
          priceCurrency: "EUR",
          price: product.price.toFixed(2),
          availability: product.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      })
      document.head.appendChild(schema)
      return () => schema.remove()
    } else if (!isLoading) {
      document.title = "Product Not Found | We Are Clearance"
    }
    return undefined
  }, [product, isLoading])

  if (isLoading && !product) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-16 md:px-8 animate-pulse">
        <div className="h-4 w-48 bg-muted mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          <div className="aspect-[4/5] bg-muted/50"></div>
          <div className="space-y-6">
            <div className="h-3 w-24 bg-muted"></div>
            <div className="h-12 w-3/4 bg-muted"></div>
            <div className="h-4 w-32 bg-muted"></div>
            <div className="h-8 w-24 bg-muted mt-8"></div>
            <div className="h-24 w-full bg-muted mt-8"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <Tag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-6" />
        <h1 className="font-display italic text-4xl mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The item you are looking for does not exist or has been removed.</p>
        <Button asChild className="rounded-none uppercase tracking-widest text-xs h-12 px-8">
          <Link href="/">Return to Storefront</Link>
        </Button>
      </div>
    )
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const isOutOfStock = product.inventory === 0
  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addToCart(product, quantity)
    toast({
      title: "Added to Bag",
      description: `${quantity} ${quantity === 1 ? 'item' : 'items'} of ${product.name} added to your bag.`,
    })
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-16 md:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-8 whitespace-nowrap overflow-x-auto hide-scrollbar">
        <Link href="/" className="hover:text-primary transition-colors shrink-0">Home</Link>
        <ChevronRight className="h-3 w-3 mx-2 shrink-0" />
        <Link 
          href={`/collections/${product.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} 
          className="hover:text-primary transition-colors shrink-0"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3 mx-2 shrink-0" />
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      {/* Main Product Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-[#fbfaf7] border border-border flex items-center justify-center p-8 overflow-hidden group">
          {product.badge && (
            <div className="absolute top-6 left-6 z-10">
              <Badge className="pointer-events-none rounded-none border border-blue-200/80 bg-white/95 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-950 shadow-[0_8px_24px_-12px_rgba(30,64,175,0.55)] backdrop-blur-md before:mr-2 before:h-1.5 before:w-1.5 before:rotate-45 before:bg-blue-600 before:content-['']">
                {product.badge}
              </Badge>
            </div>
          )}
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.02]"
            />
          ) : (
            <span className="font-display italic text-6xl text-muted-foreground/30">C</span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-700">
              {product.category}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-4 text-foreground">
            {product.name}
          </h1>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            SKU: {product.sku}
          </p>

          <div className="flex items-end gap-3 mb-6">
            <span className="font-display text-3xl text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-sm font-medium text-muted-foreground line-through mb-1">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="mb-1 bg-blue-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>

          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            {product.shortDescription}
          </p>
          
          <div className="border-t border-border py-8">
             {/* Stock Status */}
             <div className="flex items-center gap-2.5 mb-6">
               <div className={`h-2 w-2 rounded-full ${isOutOfStock ? 'bg-red-500' : product.inventory < 10 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
               <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
                 {isOutOfStock ? 'Out of Stock' : (product.inventory < 10 ? `Low Stock (${product.inventory} left)` : 'In Stock')}
               </span>
             </div>

             {/* Quantity & Add */}
             <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-border h-14 bg-white w-full sm:w-36 shrink-0">
                  <button 
                    type="button" 
                    className="flex-1 flex justify-center items-center h-full hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock || quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-sm text-foreground">{quantity}</span>
                  <button 
                    type="button" 
                    className="flex-1 flex justify-center items-center h-full hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                    onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                    disabled={isOutOfStock || quantity >= product.inventory}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button 
                  className="flex-1 rounded-none h-14 bg-primary text-white hover:bg-primary/90 uppercase tracking-[0.2em] text-[11px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  Add to Bag
                </Button>
             </div>
          </div>

          <div className="border-t border-border pt-8 mt-4">
            <h3 className="font-sans font-semibold uppercase tracking-[0.15em] text-xs text-foreground mb-4">Product Details</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.longDescription || product.description || product.shortDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 md:mt-32 border-t border-border pt-16 md:pt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4 mb-8">
            <h2 className="font-display text-3xl md:text-4xl text-foreground italic">Similar pieces</h2>
            <Button asChild variant="link" className="h-auto px-0 pb-1 text-xs font-semibold uppercase tracking-widest text-primary hover:text-primary/80">
              <Link href={`/collections/${product.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}>
                Explore Department <ChevronRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rp => (
               <article key={rp.id} className="retail-card group flex flex-col relative bg-white pb-5">
                 {rp.badge && (
                   <div className="absolute top-4 left-4 z-10">
                     <Badge className="pointer-events-none rounded-none border border-blue-200/80 bg-white/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-950 shadow-[0_8px_24px_-12px_rgba(30,64,175,0.55)] backdrop-blur-md before:mr-2 before:h-1.5 before:w-1.5 before:rotate-45 before:bg-blue-600 before:content-['']">
                       {rp.badge}
                     </Badge>
                   </div>
                 )}
                 <Link href={`/products/${rp.slug}`} className="relative aspect-[4/5] bg-muted/30 overflow-hidden flex items-center justify-center p-6 border-b border-border/50">
                   {rp.imageUrl ? (
                     <>
                     <img 
                       src={rp.imageUrl} 
                       alt={rp.name} 
                       className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                       onError={(e) => {
                         e.currentTarget.style.display = "none"
                         e.currentTarget.nextElementSibling?.classList.remove("hidden")
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
                     {rp.category}
                   </p>
                   <Link href={`/products/${rp.slug}`} className="hover:text-primary transition-colors">
                     <h3 className="line-clamp-2 text-sm font-medium leading-relaxed">
                       {rp.name}
                     </h3>
                   </Link>
                   <div className="flex flex-col items-center justify-end mt-auto pt-4">
                     <div className="flex items-baseline gap-2 justify-center">
                       <span className="font-display text-xl text-foreground block">
                         {formatPrice(rp.price)}
                       </span>
                       {rp.compareAtPrice && rp.compareAtPrice > rp.price && (
                         <span className="text-[11px] font-medium text-muted-foreground line-through block mb-1">
                           {formatPrice(rp.compareAtPrice)}
                         </span>
                       )}
                     </div>
                   </div>
                 </div>
               </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
