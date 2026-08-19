import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/toaster'
import NotFound from '@/pages/not-found'
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter'
import { CartProvider } from '@/lib/cart'
import { Navbar } from '@/components/navbar'
import Storefront from '@/pages/storefront'
import Checkout from '@/pages/checkout'
import Admin from '@/pages/admin'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function Router() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <div className="flex-1">
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/" component={Storefront} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/admin" component={Admin} />
            <Route component={NotFound} />
          </Switch>
        </RoutedErrorBoundary>
      </div>
    </div>
  )
}

function RoutedErrorBoundary({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  )
}

export default App
