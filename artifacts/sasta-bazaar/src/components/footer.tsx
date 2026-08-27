import { useEffect, useState } from "react"
import { Link } from "wouter"
import { ArrowUp, Facebook, Instagram, Mail, ShieldCheck, Truck, RefreshCw, ChevronRight } from "lucide-react"
import clearanceLogo from "@/assets/logo.jpg"

const footerBenefits = [
  { Icon: Truck, title: "Fast Delivery", description: "Straight to your door" },
  { Icon: ShieldCheck, title: "Price Match", description: "Best value guaranteed" },
  { Icon: RefreshCw, title: "Easy Returns", description: "30-day hassle-free" },
  { Icon: Mail, title: "24/7 Support", description: "Here when you need us" },
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
          className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      
      <footer className="bg-white border-t border-border mt-auto">
        {/* Benefits Bar */}
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
              {footerBenefits.map(({ Icon, title, description }, index) => (
                <div key={`${title}-${index}`} className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4 p-2">
                  <div className="h-12 w-12 rounded-full bg-white border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">{title}</h4>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
            
            <div className="lg:col-span-4 space-y-6">
              <img
                src={clearanceLogo}
                alt="We are Clearance"
                 className="h-20 w-auto object-contain sm:h-24"
              />
              <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
                Your trusted destination for clearance deals across the UK and Ireland. 
                Premium products without the premium price tag.
              </p>
              <div className="flex gap-3 pt-2">
                <a href="#" aria-label="Facebook" className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-white transition-all">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" aria-label="Instagram" className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:border-primary hover:text-white transition-all">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold uppercase tracking-wider text-sm mb-6">Shop</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/?menu=under-10" className="hover:text-primary transition-colors">Under £10 Deals</Link></li>
                <li><Link href="/?menu=last-chance" className="hover:text-primary transition-colors">Last Chance</Link></li>
                <li><Link href="/#departments" className="hover:text-primary transition-colors">All Departments</Link></li>
                <li><Link href="/checkout" className="hover:text-primary transition-colors">Your Basket</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold uppercase tracking-wider text-sm mb-6">Support</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Centre</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Delivery Info</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Returns Policy</a></li>
                <li><Link href="/admin" className="hover:text-primary transition-colors">Store Admin</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <h3 className="font-bold uppercase tracking-wider text-sm mb-6">Join Our Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get exclusive access to our biggest clearance events before they go public.
              </p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  aria-label="Email address" 
                  placeholder="Enter your email" 
                  className="flex-1 h-12 rounded-md border border-border bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  required
                />
                <button type="submit" className="h-12 w-12 rounded-md bg-black text-white flex items-center justify-center hover:bg-primary transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
            <p>© {new Date().getFullYear()} We Are Clearance. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
