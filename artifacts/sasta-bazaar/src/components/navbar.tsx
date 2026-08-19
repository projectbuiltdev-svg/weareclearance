import { Link } from "wouter"
import { ShoppingBag, ShieldAlert } from "lucide-react"
import { useCart } from "@/lib/cart"
import { Button } from "./ui/button"
import clearanceLogo from "@assets/_weareclearance.com_logo__1787141491881.jpg"

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
    </header>
  )
}
