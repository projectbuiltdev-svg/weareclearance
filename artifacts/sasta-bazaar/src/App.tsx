import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/toaster'
import NotFound from '@/pages/not-found'
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter'
import { CartProvider } from '@/lib/cart'
import { CurrencyProvider } from '@/lib/currency'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import Storefront from '@/pages/storefront'
import Checkout from '@/pages/checkout'
import Admin from '@/pages/admin'
import ProductDetail from '@/pages/product-detail'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ClerkProvider, SignIn, SignUp } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';

const queryClient = new QueryClient()

const clerkPubKey = publishableKeyFromHost(
  typeof window !== 'undefined' ? window.location.hostname : 'weareclearance.com',
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: typeof window !== 'undefined' ? `${window.location.origin}${basePath}/logo.jpg` : "",
  },
  variables: {
    colorPrimary: "hsl(222 47% 25%)",
    colorForeground: "hsl(0 0% 7%)",
    colorMutedForeground: "hsl(0 0% 40%)",
    colorDanger: "hsl(355 75% 45%)",
    colorBackground: "hsl(42 33% 98%)",
    colorInput: "hsl(42 33% 98%)",
    colorInputForeground: "hsl(0 0% 7%)",
    colorNeutral: "hsl(210 11% 87%)",
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#FAFAFA] border border-[#DDDDDD] rounded-none w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-display text-2xl font-normal tracking-tight text-[#111111]",
    headerSubtitle: "text-sm text-[#666666] font-light",
    socialButtonsBlockButtonText: "font-semibold text-xs tracking-widest uppercase text-[#111111]",
    formFieldLabel: "text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666666]",
    footerActionLink: "text-primary hover:text-primary/90 font-medium",
    footerActionText: "text-[#666666]",
    dividerText: "text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666666]",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-[#666666]",
    alertText: "text-[#666666]",
    logoBox: "h-20 flex justify-center mb-6",
    logoImage: "h-full w-auto object-contain mix-blend-multiply",
    socialButtonsBlockButton: "h-12 border border-[#DDDDDD] rounded-none hover:bg-black/5 transition-colors",
    formButtonPrimary: "h-12 bg-primary text-white hover:bg-primary/90 rounded-none text-xs uppercase tracking-widest font-semibold transition-colors",
    formFieldInput: "h-11 bg-transparent border-b border-0 border-[#DDDDDD] rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base font-light w-full",
    footerAction: "border-t border-[#DDDDDD] pt-6 mt-6",
    dividerLine: "bg-[#DDDDDD]",
    alert: "border border-[#DDDDDD] bg-[#FAFAFA] rounded-none",
    otpCodeFieldInput: "border-b border-[#DDDDDD] rounded-none bg-transparent",
    formFieldRow: "space-y-4",
    main: "gap-6",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[calc(100dvh-140px)] items-center justify-center bg-background px-4 py-12">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/admin`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100dvh-140px)] items-center justify-center bg-background px-4 py-12">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/admin`}
      />
    </div>
  );
}

function Router() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/" component={Storefront} />
            <Route path="/collections/:collection" component={Storefront} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/admin" component={Admin} />
            <Route path="/admin/" component={Admin} />
            <Route path="/products/:slug" component={ProductDetail} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route component={NotFound} />
          </Switch>
        </RoutedErrorBoundary>
      </div>
      <Footer />
    </div>
  )
}

function RoutedErrorBoundary({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>
}

function ClerkProviderWithRoutes() {
  const [location, setLocation] = useLocation();
  const clerkRoute = location.startsWith("/sign-in") || location.startsWith("/sign-up");
  const content = (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <CurrencyProvider>
          <Router />
          <Toaster />
        </CurrencyProvider>
      </CartProvider>
    </QueryClientProvider>
  );

  if (!clerkRoute) return content;

  return (
    <ClerkProvider
      publishableKey={clerkPubKey || ""}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Administrator Sign In",
            subtitle: "Access the curation dashboard",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      {content}
    </ClerkProvider>
  )
}

function App({ ssrPath }: { ssrPath?: string } = {}) {
  return (
    <WouterRouter base={basePath} ssrPath={ssrPath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  )
}

export default App
