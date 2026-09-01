import { useEffect, useState } from "react"
import { Link } from "wouter"
import { ArrowUp, Facebook, Instagram, Mail, ShieldCheck, Truck, RefreshCw, ChevronRight } from "lucide-react"
import clearanceLogo from "@/assets/logo.jpg"

const footerBenefits = [
  { title: "Complimentary Delivery", description: "On all orders over £50" },
  { title: "Price Match", description: "Best value guaranteed" },
  { title: "30-Day Returns", description: "Hassle-free process" },
  { title: "Client Services", description: "Available 24/7" },
]

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {showBackToTop && (
        <button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 inline-flex h-12 w-12 items-center justify-center bg-primary text-white transition-transform hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-none shadow-md"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      
      <footer className="bg-white border-t border-border mt-auto font-sans">
        {/* Benefits Bar */}
        <div className="border-b border-border/60 bg-muted/20">
          <div className="container mx-auto px-4 py-8 md:py-10">
            <div className="grid grid-cols-2 gap-px overflow-hidden bg-border/60 lg:grid-cols-4">
              {footerBenefits.map(({ title, description }, index) => (
                <div
                  key={`${title}-${index}`}
                  className="flex min-h-[116px] min-w-0 flex-col items-center justify-center bg-[#fbfaf7] px-3 py-5 text-center lg:min-h-[96px] lg:px-5"
                >
                  <h4 className="flex min-h-11 items-end justify-center font-display text-base italic leading-tight sm:text-lg">
                    {title}
                  </h4>
                  <p className="mt-1 flex min-h-8 items-start justify-center text-[10px] uppercase leading-4 tracking-[0.14em] text-muted-foreground sm:text-xs sm:tracking-widest">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-12">
            
            <div className="lg:col-span-4 space-y-8">
              <img
                src={clearanceLogo}
                alt="We are Clearance"
                 className="h-20 w-auto object-contain sm:h-24 mix-blend-multiply"
              />
              <p className="text-sm leading-relaxed text-muted-foreground max-w-sm font-light">
                Your online destination for curated clearance across the UK and Ireland. Free next or priority delivery for orders over €50 (£50) on the island of Ireland.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="#" aria-label="Facebook" className="h-10 w-10 border border-border flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-white transition-all rounded-none">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" aria-label="Instagram" className="h-10 w-10 border border-border flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-white transition-all rounded-none">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-sans font-semibold uppercase tracking-[0.15em] text-xs mb-6 text-foreground">The Collections</h3>
              <ul className="space-y-4 text-sm text-muted-foreground font-light">
                <li><Link href="/collections/deals" className="hover:text-primary transition-colors">Under £10 Edit</Link></li>
                <li><Link href="/collections/last-chance" className="hover:text-primary transition-colors">The Archive</Link></li>
                <li><Link href="/#departments" className="hover:text-primary transition-colors">All Departments</Link></li>
                <li><Link href="/checkout" className="hover:text-primary transition-colors">Your Bag</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-sans font-semibold uppercase tracking-[0.15em] text-xs mb-6 text-foreground">Client Services</h3>
              <ul className="space-y-4 text-sm text-muted-foreground font-light">
                <li><a href="#" className="hover:text-primary transition-colors">Concierge</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Delivery Information</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Returns & Exchanges</a></li>
              </ul>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <h3 className="font-sans font-semibold uppercase tracking-[0.15em] text-xs mb-6 text-foreground">The Insider</h3>
              <p className="text-sm text-muted-foreground font-light mb-4 leading-relaxed">
                Join our private list to receive early access to seasonal curations and exclusive clearance events.
              </p>
              <form className="flex" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  aria-label="Email address" 
                  placeholder="Email Address" 
                  className="flex-1 h-12 border border-border bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 rounded-none font-light"
                  required
                />
                <button type="submit" className="h-12 w-12 bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors rounded-none shrink-0 border border-primary">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border bg-white">
          <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            <p>© {new Date().getFullYear()} We Are Clearance.</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms & Conditions</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
