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

const mainNavItems = [
  { label: "Deals", menu: "under-10" },
  { label: "Home & Living", menu: "bedroom" },
  { label: "Kitchen & Dining", menu: "cookware" },
  { label: "Gifts", menu: "gifts-for-her" },
  { label: "Last Chance", menu: "last-chance", isHighlight: true },
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
          <Link href="/admin" className="hover:text-primary-foreground/80 transition-colors">
            Store Admin
          </Link>
          <div className="flex items-center gap-2 border-l border-white/20 pl-4">
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

      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4 lg:gap-8">
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
                <img src={clearanceLogo} alt="We are Clearance" className="h-12 w-auto object-contain" />
                <SheetTitle className="sr-only">Menu</SheetTitle>
              </SheetHeader>
              <div className="py-4 flex flex-col gap-1">
                {mainNavItems.map(({ label, menu, isHighlight }) => (
                  <SheetClose key={label} asChild>
                    <a
                      href={`/?menu=${menu}#all-products`}
                      className={`px-6 py-3 text-lg font-medium transition-colors hover:bg-muted ${
                        isHighlight ? "text-primary font-bold" : "text-foreground"
                      }`}
                    >
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

          <Link href="/" className="flex items-center shrink-0">
            <img
              src={clearanceLogo}
              alt="We are Clearance"
               className="h-20 sm:h-24 lg:h-28 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 justify-center flex-1">
          {mainNavItems.map(({ label, menu, isHighlight }) => (
            <a
              key={label}
              href={`/?menu=${menu}#all-products`}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors hover:bg-muted ${
                isHighlight ? "text-primary" : "text-foreground"
              }`}
            >
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
