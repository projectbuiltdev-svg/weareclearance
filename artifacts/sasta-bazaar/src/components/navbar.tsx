import { Link } from "wouter"
import {
  Menu,
  ShoppingBag,
  Search,
  User,
  PoundSterling,
  Euro,
  ChevronDown
} from "lucide-react"
import { useCart } from "@/lib/cart"
import { useCurrency } from "@/lib/currency"
import { Button } from "./ui/button"
import {
  Sheet,
  SheetClose,
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
    label: "Deals",
    items: [
      { label: "£5 & Under", menu: "under-5" },
      { label: "£10 & Under", menu: "under-10" },
      { label: "£20 & Under", menu: "under-20" },
      { label: "Multibuy Deals", menu: "multibuy" },
      { label: "Bulk Buys", menu: "bulk" },
    ],
  },
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white text-black">
      {/* Top utility bar */}
      <div className="hidden sm:flex items-center justify-between px-4 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium">
        <div className="flex items-center gap-4">
          <span>Fast, fair delivery straight to your door</span>
        </div>
        <div className="flex items-center gap-4">
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

      <div className="container mx-auto flex h-24 items-center justify-between gap-4 px-4 pb-1 pt-3 lg:gap-8">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden -ml-2 text-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 bg-white">
              <SheetHeader className="p-4 border-b border-border text-left">
                <img src={clearanceLogo} alt="We are Clearance" className="h-16 max-w-full object-contain" />
                <SheetTitle className="sr-only">Menu</SheetTitle>
              </SheetHeader>
              <div className="py-4 flex flex-col gap-1">
                {navGroups.map(({ label, items: groupItems }) => (
                  <div key={label} className="border-b border-border px-6 py-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-secondary">{label}</p>
                    <div className="grid gap-1">
                      {groupItems.map((item) => (
                        <SheetClose key={item.menu} asChild>
                          <a
                            href={`/?menu=${item.menu}#all-products`}
                            className="rounded-md px-2 py-2 text-base font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                          >
                            {item.label}
                          </a>
                        </SheetClose>
                      ))}
                    </div>
                  </div>
                ))}
                {directNavItems.map(({ label, menu }) => (
                  <SheetClose key={menu} asChild>
                    <a href={`/?menu=${menu}#all-products`} className="px-6 py-4 text-lg font-bold text-primary transition-colors hover:bg-muted">
                      {label}
                    </a>
                  </SheetClose>
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

          <Link href="/" className="flex h-[68px] shrink-0 items-center sm:h-[72px] lg:h-[76px]">
            <img
              src={clearanceLogo}
              alt="We are Clearance"
              className="h-full max-h-full w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="relative hidden flex-1 items-center justify-center gap-1 overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(135deg,#05070d_0%,#0b1738_52%,#06102a_100%)] p-1.5 shadow-[0_18px_45px_-20px_rgba(3,15,45,0.8),inset_0_1px_0_rgba(255,255,255,0.18)] lg:flex">
          <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          <span className="pointer-events-none absolute -left-12 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-blue-500/20 blur-2xl" />
          <span className="pointer-events-none absolute -right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-red-500/20 blur-2xl" />
          {navGroups.map(({ label, items: groupItems }) => (
            <DropdownMenu key={label}>
              <DropdownMenuTrigger asChild>
                <button className="group relative z-10 inline-flex items-center rounded-xl border border-transparent px-5 py-3 text-[14px] font-extrabold uppercase tracking-[0.08em] text-white/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/10 hover:text-white hover:shadow-[0_10px_24px_-12px_rgba(255,255,255,0.65)] data-[state=open]:border-white/20 data-[state=open]:bg-white data-[state=open]:text-slate-950 data-[state=open]:shadow-xl">
                  {label === "Deals" && <span className="mr-2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_3px_rgba(239,68,68,0.7)]" />}
                  {label}
                  <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-70 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-72 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-2.5 shadow-[0_28px_70px_-20px_rgba(2,12,35,0.55)] backdrop-blur-xl">
                <div className="mb-2 rounded-xl bg-[linear-gradient(135deg,#080d1b,#102759)] px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white">
                  Explore {label}
                </div>
                {groupItems.map((item) => (
                  <DropdownMenuItem key={item.menu} asChild className="group/item rounded-xl px-3.5 py-3 text-sm font-bold focus:bg-red-50 focus:text-primary">
                    <a href={`/?menu=${item.menu}#all-products`} className="flex items-center justify-between">
                      {item.label}
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-200 transition-all group-hover/item:bg-primary group-hover/item:shadow-[0_0_8px_rgba(229,16,29,0.55)]" />
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
          {directNavItems.map(({ label, menu }) => (
            <a key={menu} href={`/?menu=${menu}#all-products`} className="relative z-10 ml-1 overflow-hidden rounded-xl border border-red-400/40 bg-[linear-gradient(135deg,#ff2333_0%,#d40717_55%,#a9000c_100%)] px-5 py-3 text-[14px] font-black uppercase tracking-[0.1em] text-white shadow-[0_10px_26px_-10px_rgba(220,10,25,0.85),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-300 before:absolute before:inset-y-0 before:-left-1/2 before:w-1/3 before:skew-x-[-20deg] before:bg-white/25 before:blur-sm before:transition-all before:duration-700 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-10px_rgba(220,10,25,0.95)] hover:before:left-[130%]">
              {label}
            </a>
          ))}
        </nav>

        {/* Utilities */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0">
          <Button variant="ghost" size="icon" className="hidden sm:flex text-foreground hover:bg-muted">
            <Search className="h-5 w-5" />
          </Button>
          
          <Link href="/admin" className="hidden sm:block">
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
              <User className="h-5 w-5" />
            </Button>
          </Link>

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
