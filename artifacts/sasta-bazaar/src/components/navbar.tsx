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
        <nav className="hidden lg:flex items-center gap-1 justify-center flex-1">
          {navGroups.map(({ label, items: groupItems }) => (
            <DropdownMenu key={label}>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary">
                  {label}
                  <ChevronDown className="ml-1.5 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-60 rounded-xl border border-border bg-white p-2 shadow-xl">
                {groupItems.map((item) => (
                  <DropdownMenuItem key={item.menu} asChild className="rounded-lg px-3 py-2.5 text-sm font-medium focus:bg-muted focus:text-primary">
                    <a href={`/?menu=${item.menu}#all-products`}>{item.label}</a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
          {directNavItems.map(({ label, menu }) => (
            <a key={menu} href={`/?menu=${menu}#all-products`} className="rounded-md px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/5">
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
