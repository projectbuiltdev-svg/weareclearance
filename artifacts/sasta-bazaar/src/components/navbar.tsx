import { Link } from "wouter"
import { ChevronDown, MoreHorizontal, ShoppingBag, ShieldAlert } from "lucide-react"
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

const giftsMenuItems = [
  ["🌷", "Gifts for Her", "gifts-for-her"],
  ["🎩", "Gifts for Him", "gifts-for-him"],
  ["🏡", "Home Gifts", "home-gifts"],
  ["🎀", "Gift Sets", "gift-sets"],
] as const

const householdMenuItems = [
  ["🧽", "Cleaning", "cleaning"],
  ["🧻", "Paper Products", "paper-products"],
  ["🗑️", "Bin Bags", "bin-bags"],
  ["🏡", "Household Essentials", "household-essentials"],
] as const

const gardenMenuItems = [
  ["🪑", "Garden Furniture", "garden-furniture"],
  ["🌱", "Garden Accessories", "garden-accessories"],
  ["⛺", "Camping & Outdoor", "camping-outdoor"],
] as const

const mainMenuItems = [
  ["⚡", "Last Chance Clearance", "last-chance"],
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
      <nav aria-label="Main menu" className="border-t border-white/15 bg-gradient-to-r from-[#111111] via-black to-[#111111] shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <div className="container mx-auto flex items-center justify-start gap-1.5 overflow-x-auto px-3 py-2 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex flex-none items-center rounded-full border border-primary/50 bg-primary/15 px-3 py-1.5 text-xs font-black text-white transition-all hover:border-primary hover:bg-primary/25"
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
                className="inline-flex flex-none items-center rounded-full border border-transparent px-3 py-1.5 text-xs font-bold text-white/85 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
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
                className="inline-flex flex-none items-center rounded-full border border-transparent px-3 py-1.5 text-xs font-bold text-white/85 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center text-xs font-bold text-white/85 transition-colors hover:text-white"
              >
                <span className="mr-1.5" aria-hidden="true">🎁</span>
                Gifts
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              {giftsMenuItems.map(([icon, label, menu]) => (
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
                <span className="mr-1.5" aria-hidden="true">🧹</span>
                Household
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-52">
              {householdMenuItems.map(([icon, label, menu]) => (
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
                <span className="mr-1.5" aria-hidden="true">🌿</span>
                Garden &amp; Outdoor
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              {gardenMenuItems.map(([icon, label, menu]) => (
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
              className="inline-flex flex-none items-center rounded-full border border-transparent px-3 py-1.5 text-xs font-bold text-white/85 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <span className="mr-1.5" aria-hidden="true">{icon}</span>
              {label}
            </a>
          ))}
          <a
            href="/#departments"
            className="inline-flex flex-none items-center rounded-full border border-secondary/50 px-3 py-1.5 text-xs font-black text-secondary transition-all hover:bg-secondary hover:text-secondary-foreground"
          >
            <MoreHorizontal className="mr-1 h-3.5 w-3.5" />
            More
          </a>
        </div>
      </nav>
    </header>
  )
}
