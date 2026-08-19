import { Link } from "wouter"
import {
  Archive,
  Armchair,
  Bath,
  Bed,
  BedDouble,
  Box,
  ChefHat,
  ChevronDown,
  CircleDollarSign,
  Cloud,
  CookingPot,
  Flame,
  Gift,
  House,
  Layers,
  Leaf,
  MoreHorizontal,
  Package,
  PartyPopper,
  Plug,
  PoundSterling,
  Shirt,
  ShoppingBag,
  ShieldAlert,
  SprayCan,
  Sprout,
  Tag,
  Tent,
  Utensils,
  Wine,
  Zap,
} from "lucide-react"
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
  { Icon: PoundSterling, label: "£5 & Under", menu: "under-5" },
  { Icon: CircleDollarSign, label: "£10 & Under", menu: "under-10" },
  { Icon: Tag, label: "£20 & Under", menu: "under-20" },
  { Icon: PartyPopper, label: "Multibuy Deals", menu: "multibuy" },
  { Icon: Package, label: "Bulk Buys", menu: "bulk" },
]

const homeMenuItems = [
  { Icon: BedDouble, label: "Bedroom", menu: "bedroom" },
  { Icon: Cloud, label: "Pillows", menu: "pillows" },
  { Icon: Bed, label: "Duvet Covers & Bed Sets", menu: "duvet" },
  { Icon: Layers, label: "Sheets", menu: "sheets" },
  { Icon: Bath, label: "Bathroom", menu: "bathroom" },
  { Icon: Bath, label: "Towels", menu: "towels" },
  { Icon: Shirt, label: "Bathrobes", menu: "bathrobes" },
  { Icon: Archive, label: "Storage & Organisation", menu: "storage" },
]

const kitchenMenuItems = [
  { Icon: CookingPot, label: "Cookware", menu: "cookware" },
  { Icon: Plug, label: "Kitchen Appliances", menu: "appliances" },
  { Icon: Box, label: "Food Storage", menu: "food-storage" },
  { Icon: Wine, label: "Glassware & Drinkware", menu: "glassware" },
  { Icon: Utensils, label: "Kitchen Accessories", menu: "kitchen-accessories" },
]

const giftsMenuItems = [
  { Icon: Gift, label: "Gifts for Her", menu: "gifts-for-her" },
  { Icon: Gift, label: "Gifts for Him", menu: "gifts-for-him" },
  { Icon: House, label: "Home Gifts", menu: "home-gifts" },
  { Icon: Package, label: "Gift Sets", menu: "gift-sets" },
]

const householdMenuItems = [
  { Icon: SprayCan, label: "Cleaning", menu: "cleaning" },
  { Icon: Layers, label: "Paper Products", menu: "paper-products" },
  { Icon: Archive, label: "Bin Bags", menu: "bin-bags" },
  { Icon: House, label: "Household Essentials", menu: "household-essentials" },
]

const gardenMenuItems = [
  { Icon: Armchair, label: "Garden Furniture", menu: "garden-furniture" },
  { Icon: Sprout, label: "Garden Accessories", menu: "garden-accessories" },
  { Icon: Tent, label: "Camping & Outdoor", menu: "camping-outdoor" },
]

const mainMenuItems = [
  { Icon: Zap, label: "Last Chance Clearance", menu: "last-chance" },
]

const navTriggerClass =
  "group inline-flex flex-none items-center rounded-xl border border-transparent px-3 py-2 text-xs font-bold tracking-wide text-white/80 transition-all duration-200 hover:-translate-y-px hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
const navIconClass = "nav-icon-pulse mr-2 h-5 w-5 transition-colors"
const dropdownContentClass =
  "min-w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#101010] p-1.5 text-white shadow-[0_18px_48px_rgba(0,0,0,0.5)]"
const dropdownItemClass =
  "rounded-xl px-3 py-2.5 text-sm font-semibold text-white/85 transition-colors focus:bg-white/10 focus:text-white"

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
      <nav aria-label="Main menu" className="border-t border-white/10 bg-[#090909] shadow-[0_14px_30px_rgba(0,0,0,0.28)]">
        <div className="container mx-auto flex items-center justify-start gap-1.5 overflow-x-auto px-3 py-2.5 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`${navTriggerClass} border-primary/60 bg-primary/15 font-black text-white shadow-[0_0_18px_rgba(255,65,65,0.16)] hover:border-primary hover:bg-primary/25`}
              >
                <Flame className="mr-2 h-5 w-5 text-[#ff6b6b] transition-colors group-hover:text-[#ff9f43]" />
                Deals
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={dropdownContentClass}>
              {dealMenuItems.map(({ Icon, label, menu }) => (
                <DropdownMenuItem key={label} className={dropdownItemClass} asChild>
                  <a href={`/?menu=${menu}#all-products`}>
                    <Icon className="nav-icon-pulse h-5 w-5 text-secondary" />
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
                className={navTriggerClass}
              >
                <House className={`${navIconClass} text-[#ffd166] group-hover:text-[#ffe29a]`} />
                Home &amp; Living
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={dropdownContentClass}>
              {homeMenuItems.map(({ Icon, label, menu }) => (
                <DropdownMenuItem key={label} className={dropdownItemClass} asChild>
                  <a href={`/?menu=${menu}#all-products`}>
                    <Icon className="nav-icon-pulse h-5 w-5 text-secondary" />
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
                className={navTriggerClass}
              >
                <ChefHat className={`${navIconClass} text-[#77dd77] group-hover:text-[#a4f3a4]`} />
                Kitchen &amp; Dining
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={dropdownContentClass}>
              {kitchenMenuItems.map(({ Icon, label, menu }) => (
                <DropdownMenuItem key={label} className={dropdownItemClass} asChild>
                  <a href={`/?menu=${menu}#all-products`}>
                    <Icon className="nav-icon-pulse h-5 w-5 text-secondary" />
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
                className={navTriggerClass}
              >
                <Gift className={`${navIconClass} text-[#f78fb3] group-hover:text-[#ffb6d0]`} />
                Gifts
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={dropdownContentClass}>
              {giftsMenuItems.map(({ Icon, label, menu }) => (
                <DropdownMenuItem key={label} className={dropdownItemClass} asChild>
                  <a href={`/?menu=${menu}#all-products`}>
                    <Icon className="nav-icon-pulse h-5 w-5 text-secondary" />
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
                className={navTriggerClass}
              >
                <SprayCan className={`${navIconClass} text-[#8ecae6] group-hover:text-[#b9e8fa]`} />
                Household
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={dropdownContentClass}>
              {householdMenuItems.map(({ Icon, label, menu }) => (
                <DropdownMenuItem key={label} className={dropdownItemClass} asChild>
                  <a href={`/?menu=${menu}#all-products`}>
                    <Icon className="nav-icon-pulse h-5 w-5 text-secondary" />
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
                className={navTriggerClass}
              >
                <Leaf className={`${navIconClass} text-[#7bd88f] group-hover:text-[#b0f2bb]`} />
                Garden &amp; Outdoor
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={dropdownContentClass}>
              {gardenMenuItems.map(({ Icon, label, menu }) => (
                <DropdownMenuItem key={label} className={dropdownItemClass} asChild>
                  <a href={`/?menu=${menu}#all-products`}>
                    <Icon className="nav-icon-pulse h-5 w-5 text-secondary" />
                    {label}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {mainMenuItems.map(({ Icon, label, menu }) => (
            <a
              key={label}
              href={`/?menu=${menu}#all-products`}
              className={navTriggerClass}
            >
              <Icon className={`${navIconClass} text-[#ff9f43] group-hover:text-[#ffd166]`} />
              {label}
            </a>
          ))}
          <a
            href="/#departments"
            className="inline-flex flex-none items-center rounded-xl border border-secondary/40 bg-secondary/10 px-3 py-2 text-xs font-black text-secondary transition-all duration-200 hover:-translate-y-px hover:border-secondary hover:bg-secondary hover:text-secondary-foreground"
          >
            <MoreHorizontal className="mr-1 h-3.5 w-3.5" />
            More
          </a>
        </div>
      </nav>
    </header>
  )
}
