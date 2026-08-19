import { useEffect, useState } from "react"
import { Link } from "wouter"
import { ArrowUp, Facebook, Instagram, Linkedin, Mail, MapPin, Music2, RefreshCw, ShieldAlert, ShieldCheck, Truck, Twitter, Youtube } from "lucide-react"
import clearanceLogo from "@assets/_weareclearance.com_logo__1787141491881.jpg"
import dublinMapPlaceholder from "@/assets/dublin-map-placeholder.svg"
import belfastMapPlaceholder from "@/assets/belfast-map-placeholder.svg"

const footerBenefits = [
  { Icon: Truck, title: "Fast, fair delivery", description: "Straight to your door", color: "text-[#ffd166]" },
  { Icon: ShieldCheck, title: "Great value, always", description: "Clear prices and real reductions", color: "text-[#77dd77]" },
  { Icon: Mail, title: "Need a hand?", description: "Our team is here to help", color: "text-[#ff8fa3]" },
  { Icon: RefreshCw, title: "Easy returns", description: "Simple, hassle-free support", color: "text-[#c4a7ff]" },
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
          className="fixed bottom-5 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      <footer className="mt-16 bg-black text-white">
      <section className="border-y border-[#f1d98b] bg-[#fff4d6]">
        <div className="overflow-hidden py-7">
          <div className="benefits-ticker flex w-max items-center gap-10 px-4">
            {[...footerBenefits, ...footerBenefits].map(({ Icon, title, description, color }, index) => (
              <div key={`${title}-${index}`} className="flex min-w-[245px] items-center gap-3">
                <Icon className={`h-7 w-7 shrink-0 ${color}`} />
                <div>
                  <p className="font-bold text-[#26221a]">{title}</p>
                  <p className="text-sm text-[#6f6246]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto grid gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <img
            src={clearanceLogo}
            alt="We are Clearance"
            className="h-20 w-auto max-w-full rounded-md object-contain sm:h-24"
          />
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">
            Useful finds, limited-time reductions, and everyday bargains for every room in your home.
          </p>
          <div className="mt-5 flex gap-2">
            <a href="#" aria-label="Facebook" className="rounded-full border border-white/15 p-2 text-white/70 transition-colors hover:border-primary hover:text-primary">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="rounded-full border border-white/15 p-2 text-white/70 transition-colors hover:border-primary hover:text-primary">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="X / Twitter" className="rounded-full border border-white/15 p-2 text-white/70 transition-colors hover:border-primary hover:text-primary">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="YouTube" className="rounded-full border border-white/15 p-2 text-white/70 transition-colors hover:border-primary hover:text-primary">
              <Youtube className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="rounded-full border border-white/15 p-2 text-white/70 transition-colors hover:border-primary hover:text-primary">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="#" aria-label="TikTok" className="rounded-full border border-white/15 p-2 text-white/70 transition-colors hover:border-primary hover:text-primary">
              <Music2 className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/90">Shop</h2>
          <div className="mt-4 grid gap-2 text-sm text-white/60">
            <Link href="/?menu=under-10" className="transition-colors hover:text-white">Under €10</Link>
            <Link href="/?menu=last-chance" className="transition-colors hover:text-white">Last chance</Link>
            <Link href="/#departments" className="transition-colors hover:text-white">All departments</Link>
            <Link href="/checkout" className="transition-colors hover:text-white">Your basket</Link>
            <Link href="/admin" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
              <ShieldAlert className="h-3.5 w-3.5" />
              Admin
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/90">Departments</h2>
          <div className="mt-4 grid gap-2 text-sm text-white/60">
            <Link href="/?menu=bedroom" className="transition-colors hover:text-white">Home &amp; Living</Link>
            <Link href="/?menu=cookware" className="transition-colors hover:text-white">Kitchen &amp; Dining</Link>
            <Link href="/?menu=garden-accessories" className="transition-colors hover:text-white">Garden &amp; Outdoor</Link>
            <Link href="/?menu=personal-care" className="transition-colors hover:text-white">Beauty &amp; Electricals</Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/90">Stay in the know</h2>
          <p className="mt-4 text-sm leading-6 text-white/60">New drops and last-chance deals, without the fuss.</p>
          <div className="mt-4 flex max-w-xs overflow-hidden rounded-xl border border-white/15 bg-white/5">
            <input aria-label="Email address" placeholder="Email address" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/40" />
            <button type="button" className="bg-primary px-4 text-xs font-black uppercase text-white transition-colors hover:bg-primary/85">Join</button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto grid gap-4 px-4 pb-10 pt-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <MapPin className="h-5 w-5 text-primary" />
              Dublin clearance location
            </div>
            <img src={dublinMapPlaceholder} alt="Dublin map placeholder" className="mt-4 h-28 w-full rounded-xl border border-white/10 object-cover" />
          </div>
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <MapPin className="h-5 w-5 text-[#ffd166]" />
              Belfast clearance location
            </div>
            <img src={belfastMapPlaceholder} alt="Belfast map placeholder" className="mt-4 h-28 w-full rounded-xl border border-white/10 object-cover" />
          </div>
        </div>
        <div className="container mx-auto flex flex-col gap-2 px-4 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 We are Clearance. Great finds. Less spend.</p>
          <p>Prices shown in euros · Availability may vary</p>
        </div>
      </div>
      </footer>
    </>
  )
}