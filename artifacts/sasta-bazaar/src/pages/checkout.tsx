import { useState } from "react"
import { useCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useLocation } from "wouter"
import { Lock, ChevronRight, ShieldCheck, Minus, Plus, Loader2 } from "lucide-react"
import { useCurrency } from "@/lib/currency"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

export default function Checkout() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart()
  const { formatPrice } = useCurrency()
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postcode, setPostcode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0 || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/orders/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not complete the order")

      toast({
        title: "Order Placed Successfully",
        description: "Thank you for shopping with We Are Clearance. Your demo order has been received.",
      })
      clearCart()
      setLocation("/")
    } catch (error) {
      toast({
        title: "Order could not be completed",
        description: error instanceof Error ? error.message : "Please review your bag and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-md mx-auto text-center space-y-8">
          <div className="w-24 h-24 border border-border flex items-center justify-center mx-auto mb-8 rounded-none">
            <ShoppingCartIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-4xl italic">Your bag is empty</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold leading-relaxed">
            There are no items in your shopping bag. Discover our latest curated collections.
          </p>
          <div className="pt-8">
            <Link href="/">
              <Button size="lg" className="w-full uppercase tracking-widest text-xs h-14 rounded-none shadow-none font-semibold">
                Explore The Collections
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-background min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-12">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Secure Checkout</span>
          </nav>

          <h1 className="font-display text-4xl md:text-5xl italic mb-12 border-b border-border pb-6">Checkout</h1>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column - Form */}
            <div className="lg:col-span-7 space-y-12">
              
              <div className="bg-white border border-border p-8 md:p-10 relative">
                <div className="flex items-baseline gap-4 mb-8 border-b border-border/50 pb-4">
                  <span className="font-display italic text-2xl text-muted-foreground">I.</span>
                  <h2 className="font-sans text-sm uppercase tracking-[0.15em] font-semibold text-foreground">Contact Information</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Full Name</Label>
                      <Input 
                        id="name" 
                        required 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 h-10 text-base"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 h-10 text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <form id="checkout-form" onSubmit={handleCheckout} className="bg-white border border-border p-8 md:p-10 relative">
                <div className="flex items-baseline gap-4 mb-8 border-b border-border/50 pb-4">
                  <span className="font-display italic text-2xl text-muted-foreground">II.</span>
                  <h2 className="font-sans text-sm uppercase tracking-[0.15em] font-semibold text-foreground">Delivery Details</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Street Address</Label>
                    <Input 
                      id="address" 
                      required 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      className="bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 h-10 text-base"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="city" className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Town / City</Label>
                      <Input 
                        id="city" 
                        required 
                        value={city} 
                        onChange={e => setCity(e.target.value)} 
                        className="bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 h-10 text-base"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="postcode" className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Postcode</Label>
                      <Input 
                        id="postcode" 
                        required 
                        value={postcode} 
                        onChange={e => setPostcode(e.target.value)} 
                        className="bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 h-10 text-base uppercase"
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="bg-white border border-border p-8 md:p-10 relative">
                <div className="flex items-baseline gap-4 mb-8 border-b border-border/50 pb-4">
                  <span className="font-display italic text-2xl text-muted-foreground">III.</span>
                  <h2 className="font-sans text-sm uppercase tracking-[0.15em] font-semibold text-foreground">Payment</h2>
                </div>
                
                <div className="bg-accent/5 border border-accent/20 p-6 flex gap-4 text-foreground mb-8">
                  <Lock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div className="text-sm font-light">
                    <p className="font-medium mb-1 uppercase tracking-widest text-[10px]">Secure Demo Checkout</p>
                    <p className="leading-relaxed">This is a demonstration environment. No real payment is required or processed. Click 'Complete Order' below to proceed.</p>
                  </div>
                </div>
                
                <Button type="submit" form="checkout-form" size="lg" disabled={isSubmitting} className="w-full text-xs uppercase tracking-widest font-semibold h-14 rounded-none bg-primary hover:bg-primary/90 text-white shadow-none">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Completing Order" : "Complete Order"}
                </Button>
              </div>

            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-border sticky top-28">
                <div className="p-8 border-b border-border">
                  <h2 className="font-sans text-sm uppercase tracking-[0.15em] font-semibold text-foreground text-center">Order Summary</h2>
                </div>
                
                <div className="p-8">
                  <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto hide-scrollbar">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-6 group">
                        <div className="w-24 h-32 bg-muted/30 flex-shrink-0 flex items-center justify-center overflow-hidden border border-border/50">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-2 transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <span className="font-display italic text-xl text-muted-foreground/30">C</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 py-1 flex flex-col">
                          <h4 className="font-medium text-sm leading-relaxed mb-1" title={item.name}>{item.name}</h4>
                          <div className="mb-auto mt-2 flex items-center gap-3">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Qty</span>
                            <div className="flex items-center border border-border">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label={`Decrease quantity of ${item.name}`}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="flex h-8 min-w-8 items-center justify-center border-x border-border text-xs font-semibold" aria-live="polite">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="flex h-8 w-8 items-center justify-center text-foreground transition-colors hover:bg-muted"
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="font-display text-lg">{formatPrice(item.price)}</span>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors underline underline-offset-4"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
                  
                  <div className="space-y-4 text-sm font-light mb-8">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery</span>
                      <span className="text-foreground">Complimentary</span>
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
                  
                  <div className="flex items-baseline justify-between mb-8">
                    <span className="font-sans text-xs uppercase tracking-[0.15em] font-semibold text-foreground">Total</span>
                    <span className="font-display text-3xl">{formatPrice(total)}</span>
                  </div>

                  <div className="grid gap-4 bg-muted/20 p-5 border border-border/50">
                    <div className="flex items-start gap-3 text-xs font-light text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-foreground shrink-0" />
                      <span>Complimentary 30-day returns and exchanges on all orders.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  )
}

function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <path d="M6 2 L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
