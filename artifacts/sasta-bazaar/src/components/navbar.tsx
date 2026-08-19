import { Link } from "wouter"
import { useState } from "react"
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
  Menu,
  Package,
  PartyPopper,
  Plug,
  PoundSterling,
  Euro,
  Shirt,
  ShoppingBag,
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
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

const mainMenuItems = [
  { Icon: Zap, label: "Last Chance Clearance", menu: "last-chance" },
]

const mobileMenuSections = [
  { title: "Deals", Icon: Flame, items: dealMenuItems },
  { title: "Home & Living", Icon: House, items: homeMenuItems },
  { title: "Kitchen & Dining", Icon: ChefHat, items: kitchenMenuItems },
  { title: "Gifts", Icon: Gift, items: giftsMenuItems },
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
  const [currency, setCurrency] = useState<"£" | "€">("€")

  return (
    <header className="sticky top-0 z-40 grid min-h-20 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center border-b-4 border-primary bg-black px-3 shadow-[0_14px_30px_rgba(0,0,0,0.32)] lg:min-h-28 lg:px-4">
      <div className="contents">
        <Link href="/" className="col-start-1 row-start-1 flex items-center hover:opacity-90 transition-opacity">
          <img
            src={clearanceLogo}
            alt="We are Clearance"
            className="h-16 w-auto max-w-[220px] rounded-md object-contain sm:h-20 sm:max-w-[300px] lg:h-24 lg:max-w-[380px]"
          />
        </Link>

        <nav className="col-start-3 row-start-1 flex items-center justify-end gap-1.5 pl-2 sm:gap-2 lg:gap-4">
          <div className="hidden items-center rounded-lg border border-white/15 bg-white/[0.06] p-0.5 sm:flex" aria-label="Currency">
            <button
              type="button"
              aria-label="Use pounds"
              aria-pressed={currency === "£"}
              onClick={() => setCurrency("£")}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-black transition-colors ${
                currency === "£" ? "bg-white text-black" : "text-white/55 hover:text-white"
              }`}
            >
              <PoundSterling className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Use euros"
              aria-pressed={currency === "€"}
              onClick={() => setCurrency("€")}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-black transition-colors ${
                currency === "€" ? "bg-white text-black" : "text-white/55 hover:text-white"
              }`}
            >
              <Euro className="h-3.5 w-3.5" />
            </button>
          </div>
          <Link href="/checkout">
            <Button variant="secondary" size="sm" className="relative h-8 px-2.5 text-xs font-black group">
              <ShoppingBag className="mr-1.5 h-4 w-4 group-hover:-rotate-12 transition-transform" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white hover:bg-white/10 hover:text-white lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto border-r-4 border-primary bg-black p-0 text-white">
              <SheetHeader className="border-b border-white/10 px-5 pb-5 pt-6 text-left">
                <img
                  src={clearanceLogo}
                  alt="We are Clearance"
                  className="h-20 w-auto max-w-[300px] rounded-md object-contain"
                />
                <SheetTitle className="sr-only">Shop Clearance</SheetTitle>
                <p className="text-sm text-white/55">Great finds. Less spend.</p>
              </SheetHeader>
              <div className="space-y-5 px-4 py-5">
                {mobileMenuSections.map(({ title, Icon, items: sectionItems }) => (
                  <section key={title}>
                    <h2 className="mb-2 flex items-center gap-2 px-2 text-xs font-black uppercase tracking-[0.18em] text-white/50">
                      <Icon className="h-4 w-4 text-secondary" />
                      {title}
                    </h2>
                    <div className="grid gap-1">
                      {sectionItems.map(({ Icon: ItemIcon, label, menu }) => (
                        <SheetClose key={label} asChild>
                          <a
                            href={`/?menu=${menu}#all-products`}
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <ItemIcon className="h-5 w-5 text-secondary" />
                            {label}
                          </a>
                        </SheetClose>
                      ))}
                    </div>
                  </section>
                ))}
                {mainMenuItems.map(({ Icon, label, menu }) => (
                  <SheetClose key={label} asChild>
                    <a
                      href={`/?menu=${menu}#all-products`}
                      className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-3 py-3 text-sm font-black text-white transition-colors hover:bg-primary/20"
                    >
                      <Icon className="h-5 w-5 text-[#ff9f43]" />
                      {label}
                    </a>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <a href="/#departments" className="block rounded-xl border border-white/10 px-3 py-3 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white">
                    Browse all departments
                  </a>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
      <nav aria-label="Main menu" className="col-start-2 row-start-1 hidden min-w-0 overflow-hidden bg-[#090909]/70 lg:block">
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto px-2 py-2.5 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        </div>
      </nav>
    </header>
  )
}
