import { useEffect, useLayoutEffect, useState } from "react"
import { useParams, Link } from "wouter"
import { useListProducts } from "@workspace/api-client-react"
import { useCart } from "@/lib/cart"
import { useCurrency } from "@/lib/currency"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, ChevronRight, Tag } from "lucide-react"

const towelGallerySkus = new Set(["SKU-2002-BS", "SKU-2002-BT", "SKU-2002-HT"])

const productImageUrl = (objectId: string) =>
  `https://weareclearance.replit.app/api/storage/objects/uploads/${objectId}`

const towelGalleryImages = [
  productImageUrl("b6ca8149-30dd-4437-9b89-5c4e43850239"),
  productImageUrl("ded604a3-9287-46b5-9b83-14a238461743"),
  productImageUrl("31eecc12-fb11-4f55-8113-d5509392e5e0"),
  productImageUrl("27f25777-d61a-4638-8cd9-658f2c158843"),
  productImageUrl("1669482d-39dd-46ce-aec2-6d28551b3c4c"),
  productImageUrl("f29fbf4b-f7c2-480a-9269-b41587bd0e0f"),
]

const beddingGallerySkus = new Set(["SKU-2013-S", "SKU-2013-D", "SKU-2013-K"])

const beddingGalleryImages = [
  productImageUrl("61bcd4ff-8658-4cb2-927b-beaba904ea27"),
  productImageUrl("f40a1b8b-e865-467f-9f50-18b5a7c411c3"),
  productImageUrl("6280adaa-ce2f-45f9-8641-b342697412e7"),
  productImageUrl("acd8bceb-7f07-4d39-b652-cf11089b1764"),
  productImageUrl("74c4af5c-9f4c-4c92-84b4-8fbdada3d233"),
]

function getProductImages(product: { sku: string; imageUrl: string } | undefined): string[] {
  if (!product) return []
  if (towelGallerySkus.has(product.sku)) return towelGalleryImages
  if (beddingGallerySkus.has(product.sku)) return beddingGalleryImages
  return [product.imageUrl]
}

export default function ProductDetail() {
  const params = useParams<{ slug: string }>()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState("")
  const { addToCart } = useCart()
  const { formatPrice } = useCurrency()
  const { toast } = useToast()

  const { data: apiProducts, isLoading } = useListProducts(
    {}, 
    { query: { queryKey: ["/api/products"] } }
  )

  const products = Array.isArray(apiProducts) ? apiProducts : []
  const product = products.find(p => p.slug === params.slug)
  const productImages = getProductImages(product)
  const displayedImage = selectedImage || productImages[0]

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [params.slug, product?.id])

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1)
    setSelectedImage(getProductImages(product)[0] ?? "")
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
        image: getProductImages(product),
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
    <main className="container mx-auto min-w-0 px-4 py-5 pb-12 md:px-8 md:py-16">
      {/* Breadcrumbs */}
      <nav className="mb-5 flex min-w-0 items-center overflow-x-auto whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hide-scrollbar md:mb-8 md:text-[10px] md:tracking-[0.2em]">
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
      <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
        {/* Image gallery */}
        <div className="min-w-0 space-y-3">
          <div className="group relative aspect-[4/3] min-w-0 overflow-hidden border border-border bg-[#fbfaf7] p-4 md:aspect-[4/5] md:p-8">
            {product.badge && (
              <div className="absolute left-3 top-3 z-10 md:left-6 md:top-6">
                <Badge className="pointer-events-none rounded-none border border-blue-200/80 bg-white/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-950 shadow-[0_8px_24px_-12px_rgba(30,64,175,0.55)] backdrop-blur-md before:mr-2 before:h-1.5 before:w-1.5 before:rotate-45 before:bg-blue-600 before:content-[''] md:px-4 md:py-2 md:text-[10px] md:tracking-[0.2em]">
                  {product.badge}
                </Badge>
              </div>
            )}
            {displayedImage ? (
              <img
                src={displayedImage}
                alt={product.name}
                className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.02]"
              />
            ) : (
              <span className="font-display italic text-6xl text-muted-foreground/30">C</span>
            )}
          </div>
          {productImages.length > 1 && (
            <div className="grid grid-cols-6 gap-2" aria-label={`${product.name} image gallery`}>
              {productImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  aria-label={`View ${product.name} image ${index + 1}`}
                  aria-pressed={displayedImage === image}
                  className={`aspect-square overflow-hidden border bg-[#fbfaf7] p-1 transition-colors ${
                    displayedImage === image ? "border-blue-700 ring-1 ring-blue-700" : "border-border hover:border-blue-400"
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-col justify-center">
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-700">
              {product.category}
            </span>
          </div>
          <h1 className="mb-3 break-words font-display text-[2rem] leading-[1.08] text-foreground md:mb-4 md:text-5xl md:leading-tight">
            {product.name}
          </h1>
          <p className="mb-5 break-all text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:mb-6 md:text-[11px]">
            SKU: {product.sku}
          </p>

          <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-2 md:mb-6">
            <span className="font-display text-[1.75rem] text-foreground md:text-3xl">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-sm font-medium text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="bg-blue-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>

          <p className="mb-6 text-[15px] leading-relaxed text-muted-foreground md:mb-8 md:text-base">
            {product.shortDescription}
          </p>
          
          <div className="border-t border-border py-6 md:py-8">
             {/* Stock Status */}
             <div className="flex items-center gap-2.5 mb-6">
               <div className={`h-2 w-2 rounded-full ${isOutOfStock ? 'bg-red-500' : product.inventory < 10 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
               <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
                 {isOutOfStock ? 'Out of Stock' : (product.inventory < 10 ? `Low Stock (${product.inventory} left)` : 'In Stock')}
               </span>
             </div>

             {/* Quantity & Add */}
              <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 sm:flex sm:gap-4">
                 <div className="flex h-14 w-28 shrink-0 items-center border border-border bg-white sm:w-36">
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

          <div className="mt-2 border-t border-border pt-6 md:mt-4 md:pt-8">
            <h3 className="font-sans font-semibold uppercase tracking-[0.15em] text-xs text-foreground mb-4">Product Details</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.longDescription || product.description || product.shortDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-border pt-10 md:mt-32 md:pt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4 mb-8">
            <h2 className="font-display text-3xl md:text-4xl text-foreground italic">Similar pieces</h2>
            <Button asChild variant="link" className="h-auto px-0 pb-1 text-xs font-semibold uppercase tracking-widest text-primary hover:text-primary/80">
              <Link href={`/collections/${product.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}>
                Explore Department <ChevronRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {relatedProducts.map(rp => (
               <article key={rp.id} className="retail-card group flex flex-col relative bg-white pb-5">
                 {rp.badge && (
                   <div className="absolute top-4 left-4 z-10">
                     <Badge className="pointer-events-none rounded-none border border-blue-200/80 bg-white/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-950 shadow-[0_8px_24px_-12px_rgba(30,64,175,0.55)] backdrop-blur-md before:mr-2 before:h-1.5 before:w-1.5 before:rotate-45 before:bg-blue-600 before:content-['']">
                       {rp.badge}
                     </Badge>
                   </div>
                 )}
                  <Link href={`/products/${rp.slug}`} className="relative flex aspect-[4/5] items-center justify-center overflow-hidden border-b border-border/50 bg-muted/30 p-3 sm:p-6">
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
                  <div className="flex flex-1 flex-col px-2.5 pt-3 text-center sm:px-5 sm:pt-5">
                   <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                     {rp.category}
                   </p>
                   <Link href={`/products/${rp.slug}`} className="hover:text-primary transition-colors">
                      <h3 className="line-clamp-2 text-xs font-medium leading-relaxed sm:text-sm">
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
