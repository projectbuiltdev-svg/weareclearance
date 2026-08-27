import { useState } from "react"
import { useCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useLocation } from "wouter"
import { Trash2, ShieldCheck, Lock, ChevronRight, CheckCircle2 } from "lucide-react"
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

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    
    toast({
      title: "Order Placed Successfully",
      description: "Thank you for shopping with We Are Clearance. Your demo order has been received.",
    })
    clearCart()
    setLocation("/")
  }

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCartIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl">Your basket is empty</h1>
          <p className="text-muted-foreground text-lg">
            Looks like you haven't added anything to your basket yet. 
            Check out our latest clearance deals.
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button size="lg" className="w-full font-bold">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-muted/30 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-semibold">Secure Checkout</span>
          </nav>

          <h1 className="font-display font-bold text-3xl mb-8">Secure Checkout</h1>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column - Form */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="bg-white rounded-xl border border-border p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
                  <h2 className="font-display font-bold text-xl">Contact Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                      <Input 
                        id="name" 
                        required 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="bg-muted/50 border-transparent focus-visible:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="bg-muted/50 border-transparent focus-visible:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <form id="checkout-form" onSubmit={handleCheckout} className="bg-white rounded-xl border border-border p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</div>
                  <h2 className="font-display font-bold text-xl">Delivery Details</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-semibold">Street Address</Label>
                    <Input 
                      id="address" 
                      required 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      className="bg-muted/50 border-transparent focus-visible:border-primary"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-semibold">Town / City</Label>
                      <Input 
                        id="city" 
                        required 
                        value={city} 
                        onChange={e => setCity(e.target.value)} 
                        className="bg-muted/50 border-transparent focus-visible:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode" className="text-sm font-semibold">Postcode</Label>
                      <Input 
                        id="postcode" 
                        required 
                        value={postcode} 
                        onChange={e => setPostcode(e.target.value)} 
                        className="bg-muted/50 border-transparent focus-visible:border-primary uppercase"
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="bg-white rounded-xl border border-border p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">3</div>
                  <h2 className="font-display font-bold text-xl">Payment</h2>
                </div>
                
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex gap-4 text-accent-foreground mb-6">
                  <Lock className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold mb-1">Secure Demo Checkout</p>
                    <p className="opacity-90">This is a demonstration environment. No real payment is required or processed. Click 'Place Order' below to complete the flow.</p>
                  </div>
                </div>
                
                <Button type="submit" form="checkout-form" size="lg" className="w-full text-lg h-14 font-bold rounded-lg bg-primary hover:bg-primary/90 text-white">
                  Place Order <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden sticky top-28">
                <div className="p-6 md:p-8 bg-muted/20 border-b border-border">
                  <h2 className="font-display font-bold text-xl">Order Summary</h2>
                </div>
                
                <div className="p-6 md:p-8">
                  <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto hide-scrollbar">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-2" />
                          ) : (
                            <span className="font-bold text-muted-foreground/30">{item.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 py-1 flex flex-col">
                          <h4 className="font-semibold text-sm leading-tight mb-1" title={item.name}>{item.name}</h4>
                          <div className="text-muted-foreground text-xs mb-auto">Qty: {item.quantity}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold">{formatPrice(item.price)}</span>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="mb-6" />
                  
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                  </div>
                  
                  <Separator className="mb-6" />
                  
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-display font-bold text-2xl">{formatPrice(total)}</span>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span>30-day returns guarantee</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Trusted by 10,000+ UK & Irish shoppers</span>
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}
