import { Link } from "wouter"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md bg-card p-12 rounded-xl bazaar-border">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
        <div>
          <h1 className="text-4xl font-display font-black mb-2 uppercase text-primary">Arey Yaar!</h1>
          <p className="text-muted-foreground text-lg font-bold">
            404 - Page not found.
          </p>
          <p className="text-muted-foreground mt-2">
            The item you're looking for is out of stock or doesn't exist.
          </p>
        </div>
        <Link href="/">
          <Button size="lg" className="w-full">
            Back to Bazaar
          </Button>
        </Link>
      </div>
    </div>
  )
}
