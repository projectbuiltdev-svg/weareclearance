import { useState } from "react"
import { useCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useLocation } from "wouter"
import { Trash2, ShieldAlert, ArrowRight, Euro } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Checkout() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart()
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    
    toast({
      title: "Order Placed Successfully!",
      description: "Thank you for shopping at Sasta Bazaar.",
    })
    clearCart()
    setLocation("/")
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display font-black text-4xl uppercase tracking-tight mb-8 text-primary">
          Checkout
        </h1>

        {items.length === 0 ? (
          <div className="bg-card p-12 text-center rounded-xl bazaar-border flex flex-col items-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Trash2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-xl bazaar-border">
                <h2 className="font-bold text-xl mb-4 border-b-2 border-muted pb-2">Order Summary</h2>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4 items-center bg-muted/50 p-3 rounded-lg border-2 border-transparent hover:border-primary/20 transition-colors">
                      <div className="w-16 h-16 bg-card rounded-md flex-shrink-0 flex items-center justify-center border-2 border-muted overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-muted-foreground">{item.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate" title={item.name}>{item.name}</h4>
                        <div className="text-primary font-bold text-sm flex items-center">
                          <Euro className="h-3 w-3" />
                          {item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 h-9 px-2 text-center"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10 h-9 w-9"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t-2 border-muted flex items-center justify-between">
                  <span className="font-bold text-lg">Total Amount:</span>
                  <span className="font-display font-black text-3xl text-primary flex items-center">
                    <Euro className="h-6 w-6 mr-1" />
                    {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-secondary/20 border-2 border-secondary p-4 rounded-xl flex gap-3 text-secondary-foreground">
                <ShieldAlert className="h-6 w-6 text-secondary flex-shrink-0" />
                <div className="text-sm font-medium">
                  <strong>Notice:</strong> Stripe is not currently connected. Real payments will not be processed. This is a demo checkout flow.
                </div>
              </div>

              <form onSubmit={handleCheckout} className="bg-card p-6 rounded-xl bazaar-border space-y-6">
                <h2 className="font-bold text-xl mb-2">Delivery Details</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      required 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input 
                      id="address" 
                      required 
                      value={address} 
                      onChange={e => setAddress(e.target.value)} 
                      placeholder="e.g. 123 Bazaar Street, New Delhi"
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full text-lg">
                  Place Order (Demo) <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
