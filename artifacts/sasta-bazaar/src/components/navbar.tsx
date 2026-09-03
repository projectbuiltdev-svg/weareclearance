import { useEffect, useState } from "react"
import { Link, useLocation } from "wouter"
import {
  Menu,
  ShoppingBag,
  Search,
  PoundSterling,
  Euro,
  ChevronDown,
  Flame,
  BadgePercent,
} from "lucide-react"
import { useCart } from "@/lib/cart"
import { useCurrency } from "@/lib/currency"
import { Button } from "./ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import clearanceLogo from "@/assets/logo.jpg"

const navGroups = [
  {
    label: "Home & Living",
    items: [
      { label: "Bedroom", menu: "bedroom" },
      { label: "Pillows", menu: "pillows" },
      { label: "Duvet Covers & Bed Sets", menu: "duvet" },
      { label: "Sheets", menu: "sheets" },
      { label: "Bathroom", menu: "bathroom" },
      { label: "Towels", menu: "towels" },
      { label: "Bathrobes", menu: "bathrobes" },
      { label: "Storage & Organisation", menu: "storage" },
    ],
  },
  {
    label: "Kitchen & Dining",
    items: [
      { label: "Cookware", menu: "cookware" },
      { label: "Kitchen Appliances", menu: "appliances" },
      { label: "Food Storage", menu: "food-storage" },
      { label: "Glassware & Drinkware", menu: "glassware" },
      { label: "Kitchen Accessories", menu: "kitchen-accessories" },
    ],
  },
  {
    label: "Gifts",
    items: [
      { label: "Gifts for Her", menu: "gifts-for-her" },
      { label: "Gifts for Him", menu: "gifts-for-him" },
      { label: "Home Gifts", menu: "home-gifts" },
      { label: "Gift Sets", menu: "gift-sets" },
    ],
  },
]

const directNavItems = [
  { label: "Last Chance", menu: "last-chance" },
]

export function Navbar() {
  const { items } = useCart()
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const { currency, setCurrency } = useCurrency()
  const [location] = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  useEffect(() => {
    if (mobileOpen) return

    const frame = window.requestAnimationFrame(() => {
      document.body.style.removeProperty("overflow")
      document.body.style.removeProperty("pointer-events")
    })

    return () => window.cancelAnimationFrame(frame)
  }, [mobileOpen])

  return (
    <header className="sticky top-0 z-50 w-full max-w-full overflow-x-clip border-b border-border bg-white text-black">
      {/* Top utility bar */}
      <div className="relative hidden min-h-8 items-center justify-center bg-secondary px-4 py-1.5 text-secondary-foreground sm:flex">
        <span className="text-center text-[10px] font-semibold uppercase tracking-[0.18em]">
          Complimentary Delivery <span aria-hidden="true">—</span> On all orders over £50
        </span>
        <div className="absolute right-4 flex items-center gap-4 border-l border-white/20 pl-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrency("£")}
              className={`hover:text-white transition-colors ${currency === "£" ? "text-white font-bold" : "text-white/60"}`}
            >
              GBP (£)
            </button>
            <button
              onClick={() => setCurrency("€")}
              className={`hover:text-white transition-colors ${currency === "€" ? "text-white font-bold" : "text-white/60"}`}
            >
              EUR (€)
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex h-20 min-w-0 items-center justify-between gap-2 px-3 pb-1 pt-2 sm:h-24 sm:gap-4 sm:px-4 sm:pt-3 lg:gap-8">
        <div className="flex items-center gap-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden -ml-2 text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex h-[100dvh] w-[min(88vw,340px)] flex-col overflow-hidden bg-white p-0">
              <SheetHeader className="shrink-0 border-b border-border p-4 text-left">
                <img src={clearanceLogo} alt="We are Clearance" className="h-16 max-w-full object-contain" />
                <SheetTitle className="sr-only">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain py-4 pb-[max(1rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">
                <a
                  href="/collections/deals"
                  onClick={() => setMobileOpen(false)}
                  className="mx-5 mb-2 flex items-center border-b border-border px-0 py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900"
                >
                  <Flame aria-hidden="true" className="mr-2 h-4 w-4 text-orange-500" />
                  Deals
                </a>
                {navGroups.map(({ label, items: groupItems }) => (
                  <details key={label} className="group border-b border-border px-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-slate-900 marker:hidden">
                      {label}
                      <ChevronDown className="h-4 w-4 text-blue-700 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="grid gap-1 pb-4">
                      {groupItems.map((item) => (
                        <a
                          key={item.menu}
                          href={`/collections/${item.menu}`}
                          onClick={() => setMobileOpen(false)}
                          className="border-l-2 border-blue-100 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-blue-700 hover:bg-blue-50 hover:text-blue-800"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </details>
                ))}
                {directNavItems.map(({ label, menu }) => (
                  <a
                    key={menu}
                    href={`/collections/${menu}`}
                    onClick={() => setMobileOpen(false)}
                    className="mx-5 mt-3 bg-blue-700 px-5 py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-white transition-colors hover:bg-blue-800"
                  >
                    {label}
                  </a>
                ))}
                
                <div className="px-6 py-4 mt-4 border-t border-border">
                  <p className="text-sm font-bold mb-3 text-muted-foreground uppercase tracking-wider">Currency</p>
                  <div className="flex gap-2">
                    <Button
                      variant={currency === "£" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrency("£")}
                      className="flex-1"
                    >
                      GBP (£)
                    </Button>
                    <Button
                      variant={currency === "€" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrency("€")}
                      className="flex-1"
                    >
                      EUR (€)
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex h-14 min-w-0 shrink items-center sm:h-[72px] sm:shrink-0 lg:h-[76px]">
            <img
              src={clearanceLogo}
              alt="We are Clearance"
              className="h-full max-h-full w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="relative hidden flex-1 items-center justify-center gap-1 overflow-hidden rounded-[22px] border border-blue-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(238,245,255,0.98)_48%,rgba(255,255,255,0.98)_100%)] p-1.5 shadow-[0_18px_50px_-26px_rgba(14,63,145,0.6),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(37,99,235,0.08)] lg:flex">
          <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/80 to-transparent" />
          <span className="pointer-events-none absolute inset-x-20 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-600/35 to-transparent" />
          <span className="pointer-events-none absolute left-1/3 top-1/2 h-20 w-40 -translate-y-1/2 rounded-full bg-blue-400/10 blur-3xl" />
          <a
            href="/collections/deals"
            className="group relative z-10 inline-flex items-center rounded-2xl border border-transparent px-5 py-3 text-[14px] font-extrabold uppercase tracking-[0.075em] text-slate-800 transition-all duration-300 after:absolute after:inset-x-5 after:bottom-1 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-blue-600 after:transition-transform after:duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:text-blue-800 hover:shadow-[0_12px_28px_-18px_rgba(30,64,175,0.7)] hover:after:scale-x-100"
          >
            <Flame aria-hidden="true" className="mr-2 h-4 w-4 text-orange-500 transition-transform duration-300 group-hover:scale-110" />
            Deals
          </a>
          {navGroups.map(({ label, items: groupItems }) => (
            <DropdownMenu key={label} modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="group relative z-10 inline-flex items-center rounded-2xl border border-transparent px-5 py-3 text-[14px] font-extrabold uppercase tracking-[0.075em] text-slate-800 transition-all duration-300 after:absolute after:inset-x-5 after:bottom-1 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-blue-600 after:transition-transform after:duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-white hover:text-blue-800 hover:shadow-[0_12px_28px_-18px_rgba(30,64,175,0.7)] hover:after:scale-x-100 data-[state=open]:border-blue-200 data-[state=open]:bg-blue-700 data-[state=open]:text-white data-[state=open]:shadow-[0_12px_28px_-14px_rgba(29,78,216,0.7)]">
                  {label}
                  <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-70 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-72 overflow-hidden rounded-[20px] border border-blue-100 bg-white/95 p-2.5 shadow-[0_28px_70px_-20px_rgba(23,65,145,0.42)] backdrop-blur-xl">
                <div className="mb-2 rounded-2xl bg-[linear-gradient(135deg,#102a62,#174ea6_55%,#2563eb)] px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                  Explore {label}
                </div>
                {groupItems.map((item) => (
                  <DropdownMenuItem key={item.menu} asChild className="group/item rounded-xl px-3.5 py-3 text-sm font-bold focus:bg-blue-50 focus:text-blue-800">
                    <a href={`/collections/${item.menu}`} className="flex items-center justify-between">
                      {item.label}
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-100 transition-all group-hover/item:bg-blue-600 group-hover/item:shadow-[0_0_8px_rgba(37,99,235,0.55)]" />
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
          {directNavItems.map(({ label, menu }) => (
            <a key={menu} href={`/collections/${menu}`} className="group relative z-10 ml-1 inline-flex items-center overflow-hidden rounded-2xl border border-blue-400/50 bg-[linear-gradient(135deg,#0b2f70_0%,#1554b5_52%,#2878e8_100%)] px-5 py-3 text-[14px] font-black uppercase tracking-[0.1em] text-white shadow-[0_12px_28px_-13px_rgba(21,84,181,0.85),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 before:absolute before:inset-y-0 before:-left-1/2 before:w-1/3 before:skew-x-[-20deg] before:bg-white/30 before:blur-sm before:transition-all before:duration-700 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-13px_rgba(21,84,181,0.95)] hover:before:left-[130%]">
              <BadgePercent aria-hidden="true" className="mr-2 h-4 w-4 text-amber-200 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" />
              {label}
            </a>
          ))}
        </nav>

        {/* Utilities */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0">
          <Button variant="ghost" size="icon" className="hidden sm:flex text-foreground hover:bg-muted">
            <Search className="h-5 w-5" />
          </Button>
          
          <Link href="/checkout">
            <Button 
              variant="default" 
              className="relative rounded-full h-11 px-4 sm:px-6 font-bold bg-primary hover:bg-primary/90 text-white shadow-sm transition-transform active:scale-95"
            >
              <ShoppingBag className="sm:mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Basket</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:top-1/2 sm:-translate-y-1/2 sm:right-2 sm:ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
