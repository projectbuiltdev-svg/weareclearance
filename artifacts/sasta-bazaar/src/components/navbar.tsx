import { Link } from "wouter"
import { ChevronDown, ShoppingBag, ShieldAlert } from "lucide-react"
import { useCart } from "@/lib/cart"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import clearanceLogo from "@assets/_weareclearance.com_logo__1787141491881.jpg"

const dealMenuItems = [
  ["💷", "£5 & Under", "under-5"],
  ["💰", "£10 & Under", "under-10"],
  ["🏷️", "£20 & Under", "under-20"],
  ["🎉", "Multibuy Deals", "multibuy"],
  ["📦", "Bulk Buys", "bulk"],
] as const

const homeMenuItems = [
  ["🛏️", "Bedroom", "bedroom"],
  ["☁️", "Pillows", "pillows"],
  ["🛌", "Duvet Covers & Bed Sets", "duvet"],
  ["🧺", "Sheets", "sheets"],
  ["🛁", "Bathroom", "bathroom"],
  ["🧖", "Towels", "towels"],
  ["🥋", "Bathrobes", "bathrobes"],
  ["🗄️", "Storage & Organisation", "storage"],
] as const

const kitchenMenuItems = [
  ["🥘", "Cookware", "cookware"],
  ["🔌", "Kitchen Appliances", "appliances"],
  ["🥡", "Food Storage", "food-storage"],
  ["🥂", "Glassware & Drinkware", "glassware"],
  ["🥄", "Kitchen Accessories", "kitchen-accessories"],
] as const

const mainMenuItems = [
  ["🎁", "Gifts", "gifts"],
  ["⚡", "Last Chance Clearance", "last-chance"],
  ["🧹", "Household", "household"],
  ["🌿", "Garden & Outdoor", "garden"],
] as const

export function Navbar() {
  const { items } = useCart()
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <header className="sticky top-0 z-40 w-full border-b-4 border-primary bg-black shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <img
            src={clearanceLogo}
            alt="We are Clearance"
            className="h-14 w-auto max-w-[250px] rounded-md object-contain"
          />
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="font-bold text-white/80 hover:bg-white/10 hover:text-white">
              <ShieldAlert className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </Link>
          <Link href="/checkout">
            <Button variant="secondary" className="relative group">
              <ShoppingBag className="h-5 w-5 mr-2 group-hover:-rotate-12 transition-transform" />
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center border-2 border-background animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </nav>
      </div>
      <nav aria-label="Main menu" className="border-t border-white/15">
        <div className="container mx-auto flex items-center gap-5 overflow-x-auto px-4 py-2.5 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center text-xs font-bold text-white/85 transition-colors hover:text-white"
              >
                <span className="mr-1.5" aria-hidden="true">🔥</span>
                Deals
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              {dealMenuItems.map(([icon, label, menu]) => (
                <DropdownMenuItem key={label} asChild>
                  <a href={`/?menu=${menu}#all-products`} className="font-bold">
                    <span aria-hidden="true">{icon}</span>
                    {label}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center text-xs font-bold text-white/85 transition-colors hover:text-white"
              >
                <span className="mr-1.5" aria-hidden="true">🏠</span>
                Home &amp; Living
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              {homeMenuItems.map(([icon, label, menu]) => (
                <DropdownMenuItem key={label} asChild>
                  <a href={`/?menu=${menu}#all-products`} className="font-bold">
                    <span aria-hidden="true">{icon}</span>
                    {label}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center text-xs font-bold text-white/85 transition-colors hover:text-white"
              >
                <span className="mr-1.5" aria-hidden="true">🍳</span>
                Kitchen &amp; Dining
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              {kitchenMenuItems.map(([icon, label, menu]) => (
                <DropdownMenuItem key={label} asChild>
                  <a href={`/?menu=${menu}#all-products`} className="font-bold">
                    <span aria-hidden="true">{icon}</span>
                    {label}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {mainMenuItems.map(([icon, label, menu]) => (
            <a
              key={label}
              href={`/?menu=${menu}#all-products`}
              className="text-xs font-bold text-white/85 transition-colors hover:text-white"
            >
              <span className="mr-1.5" aria-hidden="true">{icon}</span>
              {label}
            </a>
          ))}
          <a
            href="/#departments"
            className="ml-auto text-xs font-black text-secondary transition-colors hover:text-white"
          >
            More
          </a>
        </div>
      </nav>
    </header>
  )
}
