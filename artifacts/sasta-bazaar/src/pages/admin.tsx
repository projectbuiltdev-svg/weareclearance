import { useState, useRef, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { 
  useListProducts, 
  useListCategories,
  useGetAdminSummary, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct,
  getListProductsQueryKey,
  getGetAdminSummaryQueryKey,
  getListCategoriesQueryKey
} from "@workspace/api-client-react"
import type { Product, ProductInput } from "@workspace/api-client-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Package, LayoutGrid, AlertTriangle, Upload, 
  Plus, Edit2, Trash2, Loader2, LogOut, Search, Rocket, CheckCircle2, XCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/lib/currency"
import { Show, useAuth, useClerk } from "@clerk/react"
import { CsvImport } from "@/components/admin/csv-import"
import { ImageUpload } from "@/components/admin/image-upload"

type AdminAccess = {
  isOwner: boolean
  ownerEmail: string
  maxAdditionalAdmins: number
  admins: Array<{ email: string; clerkUserId: string | null; createdAt: string }>
}

function AdminContent({
  initialAdminAccess,
  onSignOut,
}: {
  initialAdminAccess: AdminAccess
  onSignOut: () => void
}) {
  type PublishStatus = {
    state: "idle" | "preparing" | "pushed" | "deploying" | "live" | "failed"
    message: string
    updatedAt: string
    lastPublishedAt?: string
    runUrl?: string
  }

  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { formatPrice, gbpPerEur, refreshExchangeRate } = useCurrency()
  const { getToken } = useAuth()
  
  const { data: summary, isLoading: isLoadingSummary } = useGetAdminSummary({ query: { queryKey: ["/api/admin/summary"] } })
  
  const [searchInputValue, setSearchInputValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [exchangeRate, setExchangeRate] = useState("")
  const [isSavingRate, setIsSavingRate] = useState(false)
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null)
  const [isStartingPublish, setIsStartingPublish] = useState(false)
  const [adminAccess, setAdminAccess] = useState(initialAdminAccess)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [isUpdatingAdmins, setIsUpdatingAdmins] = useState(false)

  const loadPublishStatus = async () => {
    const token = await getToken()
    const response = await fetch("/api/admin/publish-catalogue", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) throw new Error("Could not load publishing status")
    setPublishStatus(await response.json())
  }

  useEffect(() => {
    loadPublishStatus().catch(() => undefined)
  }, [])

  useEffect(() => {
    const running = publishStatus && ["preparing", "pushed", "deploying"].includes(publishStatus.state)
    if (!running) return
    const timer = window.setInterval(() => loadPublishStatus().catch(() => undefined), 4_000)
    return () => window.clearInterval(timer)
  }, [publishStatus?.state])

  const publishCatalogue = async () => {
    if (!window.confirm("Publish the current products, prices, stock, images and currency rate to the live store?")) return
    setIsStartingPublish(true)
    try {
      const token = await getToken()
      const response = await fetch("/api/admin/publish-catalogue", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || body.message || "Could not start publishing")
      setPublishStatus(body)
      toast({ title: "Catalogue publishing started" })
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Could not publish catalogue", variant: "destructive" })
    } finally {
      setIsStartingPublish(false)
    }
  }

  useEffect(() => setExchangeRate(String(gbpPerEur)), [gbpPerEur])

  const saveExchangeRate = async () => {
    const rate = Number(exchangeRate)
    if (!Number.isFinite(rate) || rate <= 0) {
      toast({ title: "Enter a valid GBP rate", variant: "destructive" })
      return
    }
    setIsSavingRate(true)
    try {
      const token = await getToken()
      const response = await fetch("/api/admin/store-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ gbpPerEur: rate }),
      })
      if (!response.ok) throw new Error("Could not save the exchange rate")
      await refreshExchangeRate()
      toast({ title: "Exchange rate updated" })
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Could not save the exchange rate", variant: "destructive" })
    } finally {
      setIsSavingRate(false)
    }
  }

  const addAdministrator = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsUpdatingAdmins(true)
    try {
      const token = await getToken()
      const response = await fetch("/api/admin/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: newAdminEmail }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not add Administrator")
      setAdminAccess(body)
      setNewAdminEmail("")
      toast({ title: "Invitation email sent", description: "They can set their own password, then sign in with this email." })
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Could not add Administrator", variant: "destructive" })
    } finally {
      setIsUpdatingAdmins(false)
    }
  }

  const removeAdministrator = async (email: string) => {
    if (!window.confirm(`Remove Administrator access for ${email}?`)) return
    setIsUpdatingAdmins(true)
    try {
      const token = await getToken()
      const response = await fetch(`/api/admin/access/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not remove Administrator")
      setAdminAccess(body)
      toast({ title: "Administrator access removed" })
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Could not remove Administrator", variant: "destructive" })
    } finally {
      setIsUpdatingAdmins(false)
    }
  }
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInputValue)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchInputValue])

  const listParams = debouncedSearch ? { search: debouncedSearch } : undefined;
  
  const { data: products, isLoading: isLoadingProducts } = useListProducts(listParams, { 
    query: { queryKey: getListProductsQueryKey(listParams) } 
  })
  const { data: categories = [] } = useListCategories()
  const lowStockProducts = (products ?? []).filter((product) => product.inventory < 10)
  
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  type ProductForm = Omit<ProductInput, "price" | "inventory" | "compareAtPrice" | "badge"> & {
    price: string
    inventory: string
    compareAtPrice: string
    badge: string
  }
  
  const defaultForm: ProductForm = {
    sku: "", name: "", shortDescription: "", longDescription: "", description: "", category: "", price: "",
    compareAtPrice: "", imageUrl: "", badge: "", featured: false, inventory: "10"
  }
  const [form, setForm] = useState(defaultForm)

  const handleOpenDialog = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product)
      setForm({
        sku: product.sku || "",
        name: product.name,
        shortDescription: product.shortDescription,
        longDescription: product.longDescription,
        description: product.longDescription,
        category: product.category,
        price: String(product.price),
        compareAtPrice: product.compareAtPrice == null ? "" : String(product.compareAtPrice),
        imageUrl: product.imageUrl,
        badge: product.badge || "",
        featured: product.featured,
        inventory: String(product.inventory)
      })
    } else {
      setEditingProduct(null)
      setForm(defaultForm)
    }
    setIsDialogOpen(true)
  }

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/products"] })
    queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() })
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      ...form,
      description: form.longDescription,
      sku: form.sku || undefined,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      inventory: Number(form.inventory),
      badge: form.badge || undefined,
    }

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: payload }, {
        onSuccess: () => {
          toast({ title: "Product updated successfully" })
          setIsDialogOpen(false)
          invalidateData()
        }
      })
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Product created successfully" })
          setIsDialogOpen(false)
          invalidateData()
        }
      })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Product deleted" })
          invalidateData()
        }
      })
    }
  }

  return (
    <main className="container mx-auto px-4 py-12 md:py-16 space-y-12 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-6">
        <div>
          <h1 className="font-display italic text-3xl md:text-4xl mb-3">Store Administration</h1>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Manage your collection, inventory, and curation.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <CsvImport onSuccess={invalidateData} />

          <Button
            type="button"
            variant="outline"
            className="h-12 px-6 uppercase tracking-widest text-xs font-semibold rounded-none border-blue-700 text-blue-800 hover:bg-blue-50"
            onClick={publishCatalogue}
            disabled={isStartingPublish || !!publishStatus && ["preparing", "pushed", "deploying"].includes(publishStatus.state)}
          >
            {isStartingPublish || publishStatus && ["preparing", "pushed", "deploying"].includes(publishStatus.state)
              ? <Loader2 className="h-4 w-4 mr-3 animate-spin" />
              : <Rocket className="h-4 w-4 mr-3" />}
            Publish catalogue
          </Button>
          
          <Button className="h-12 px-6 uppercase tracking-widest text-xs font-semibold rounded-none" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-3" />
            New Product
          </Button>
          
          <Button variant="outline" className="h-12 px-6 uppercase tracking-widest text-xs font-semibold rounded-none ml-auto border-border bg-white hover:bg-muted" onClick={onSignOut}>
            <LogOut className="h-4 w-4 mr-3 opacity-70" />
            Sign Out
          </Button>
        </div>
      </div>

      {publishStatus && publishStatus.state !== "idle" && (
        <section className={`border p-5 ${
          publishStatus.state === "failed"
            ? "border-red-200 bg-red-50"
            : publishStatus.state === "live"
              ? "border-emerald-200 bg-emerald-50"
              : "border-blue-200 bg-blue-50"
        }`}>
          <div className="flex items-start gap-3">
            {publishStatus.state === "failed"
              ? <XCircle className="mt-0.5 h-5 w-5 text-red-700" />
              : publishStatus.state === "live"
                ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
                : <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-blue-700" />}
            <div>
              <p className="text-sm font-semibold capitalize">{publishStatus.state}</p>
              <p className="mt-1 text-sm text-muted-foreground">{publishStatus.message}</p>
              {publishStatus.lastPublishedAt && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Last published {new Date(publishStatus.lastPublishedAt).toLocaleString()}
                </p>
              )}
              {publishStatus.runUrl && (
                <a href={publishStatus.runUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-blue-800 underline">
                  View deployment
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="border border-border bg-white p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-2xl">Currency conversion</h2>
            <p className="mt-2 text-sm text-muted-foreground">Set how many British pounds equal €1. Product prices are entered once in EUR and converted automatically.</p>
          </div>
          <div className="flex w-full items-end gap-3 md:w-auto">
            <div className="flex-1 space-y-2 md:w-52">
              <Label htmlFor="gbp-rate" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">GBP per EUR</Label>
              <Input id="gbp-rate" type="number" min="0.01" max="10" step="0.0001" value={exchangeRate} onChange={(event) => setExchangeRate(event.target.value)} className="rounded-none" />
            </div>
            <Button type="button" onClick={saveExchangeRate} disabled={isSavingRate} className="rounded-none">
              {isSavingRate ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save rate"}
            </Button>
          </div>
        </div>
      </section>

      <section className="border border-border bg-white p-6 md:p-8" aria-labelledby="admin-access-heading">
        <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 id="admin-access-heading" className="font-display text-2xl">Administrator access</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Every Administrator signs in with their own account. The primary owner controls who can access this dashboard.
            </p>
          </div>
          <div className="border border-border bg-muted/20 px-4 py-3 text-sm">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Primary owner</span>
            <span className="mt-1 block font-medium">{adminAccess.ownerEmail}</span>
          </div>
        </div>

        {adminAccess.isOwner ? (
          <div className="mt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="font-medium">Approved Administrators</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {adminAccess.admins.length} of {adminAccess.maxAdditionalAdmins} additional Admin accounts in use. Adding an email sends a secure invitation so that person can set their own password and sign in with that email.
                </p>
              </div>
            </div>

            <form onSubmit={addAdministrator} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Label htmlFor="new-admin-email" className="sr-only">Administrator email address</Label>
                <Input
                  id="new-admin-email"
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(event) => setNewAdminEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="rounded-none"
                  disabled={isUpdatingAdmins || adminAccess.admins.length >= adminAccess.maxAdditionalAdmins}
                />
              </div>
              <Button
                type="submit"
                className="rounded-none"
                disabled={isUpdatingAdmins || !newAdminEmail.trim() || adminAccess.admins.length >= adminAccess.maxAdditionalAdmins}
              >
                {isUpdatingAdmins ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add Administrator
              </Button>
            </form>

            {adminAccess.admins.length === 0 ? (
              <p className="mt-6 border border-dashed border-border p-4 text-sm text-muted-foreground">No additional Administrators have been approved yet.</p>
            ) : (
              <ul className="mt-6 divide-y divide-border border border-border">
                {adminAccess.admins.map((administrator) => (
                  <li key={administrator.email} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{administrator.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {administrator.clerkUserId
                          ? "Can manage products, stock, settings, and catalogue publishing."
                          : "Invitation sent — access activates when they accept it and sign in with this email."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-none border-destructive text-destructive hover:bg-destructive hover:text-white"
                      onClick={() => removeAdministrator(administrator.email)}
                      disabled={isUpdatingAdmins}
                    >
                      Remove access
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="mt-6 border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            You have Administrator access for catalogue operations. Only the primary owner can add or remove Administrators.
          </p>
        )}
      </section>

      {/* Stats */}
      {isLoadingSummary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted/50 animate-pulse border border-border" />)}
        </div>
      ) : summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 border border-border flex flex-col relative group">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">Total Products</div>
            <div className="text-4xl font-display">{summary.totalProducts}</div>
            <Package className="h-6 w-6 absolute top-8 right-8 text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </div>
          <div className="bg-white p-8 border border-border flex flex-col relative group">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">Categories</div>
            <div className="text-4xl font-display">{summary.categories}</div>
            <LayoutGrid className="h-6 w-6 absolute top-8 right-8 text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </div>
          <div className="bg-white p-8 border border-border flex flex-col relative group">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-4">Curated</div>
            <div className="text-4xl font-display">{summary.featuredProducts}</div>
            <Upload className="h-6 w-6 absolute top-8 right-8 text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </div>
          <div className="bg-white p-8 border border-destructive/30 flex flex-col relative group">
            <div className="text-[10px] font-semibold text-destructive uppercase tracking-[0.2em] mb-4">Low Stock</div>
            <div className="text-4xl font-display text-destructive">{summary.lowStockProducts}</div>
            <AlertTriangle className="h-6 w-6 absolute top-8 right-8 text-destructive/50 group-hover:text-destructive transition-colors" />
          </div>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <section className="border border-amber-300 bg-amber-50 p-6 md:p-8" aria-labelledby="low-stock-heading">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-amber-700" />
            <div className="min-w-0 flex-1">
              <h2 id="low-stock-heading" className="font-display text-2xl text-amber-950">Low stock alert</h2>
              <p className="mt-2 text-sm text-amber-900/70">These products have fewer than 10 units remaining.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {lowStockProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleOpenDialog(product)}
                    className="flex items-center justify-between border border-amber-200 bg-white px-4 py-3 text-left hover:border-amber-500"
                  >
                    <span className="truncate pr-4 text-sm font-medium">{product.name}</span>
                    <span className="shrink-0 text-xs font-bold text-amber-800">{product.inventory} left</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          value={searchInputValue}
          onChange={(e) => setSearchInputValue(e.target.value)}
          placeholder="Search products by name, SKU, or category..."
          className="pl-12 h-14 bg-white border-border rounded-none focus-visible:ring-1 focus-visible:ring-primary/20 text-base font-light shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-muted/20 border-b border-border">
                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">SKU</th>
                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Category</th>
                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Price</th>
                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Stock</th>
                <th className="px-8 py-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingProducts ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-6" />
                    <p className="font-sans text-xs uppercase tracking-widest">Loading collection...</p>
                  </td>
                </tr>
              ) : products?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-6 opacity-30" />
                    <p className="font-display italic text-2xl mb-2 text-foreground">No pieces found</p>
                    <p className="text-sm font-light">Add your first product to begin curating.</p>
                  </td>
                </tr>
              ) : (
                products?.map(p => (
                  <tr key={p.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover border border-border" />
                        <div>
                          <div className="font-medium text-foreground max-w-[300px] truncate" title={p.name}>{p.name}</div>
                          {p.badge && <Badge className="mt-2 text-[9px] uppercase tracking-widest bg-muted text-muted-foreground border-none rounded-none px-2 py-0.5">{p.badge}</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-mono text-muted-foreground">{p.sku}</td>
                    <td className="px-8 py-5 text-sm font-light text-muted-foreground">{p.category}</td>
                    <td className="px-8 py-5 font-display text-base">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-xs ${p.inventory < 5 ? 'text-destructive font-medium' : 'text-muted-foreground font-light'}`}>
                        {p.inventory} units
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary hover:text-white transition-colors rounded-none" onClick={() => handleOpenDialog(p)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive hover:text-white transition-colors ml-2 rounded-none" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] p-0 overflow-hidden bg-white border border-border rounded-none flex flex-col">
          <DialogHeader className="px-8 py-6 border-b border-border bg-muted/20 shrink-0">
            <DialogTitle className="font-display italic text-2xl">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="overflow-y-auto p-8">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              
              <div className="col-span-2 md:col-span-1 space-y-3">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Product Name</Label>
                <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-11 bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base" />
              </div>
              
              <div className="col-span-2 md:col-span-1 space-y-3">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">SKU <span className="font-normal opacity-50">(Optional)</span></Label>
                <Input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} placeholder="Auto-generated if empty" className="h-11 bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base font-mono placeholder:font-sans placeholder:text-sm placeholder:text-muted-foreground/50" />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-3">
                <Label htmlFor="product-category" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Category</Label>
                <select
                  id="product-category"
                  required
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="h-11 w-full bg-transparent border-b border-x-0 border-t-0 border-border rounded-none px-0 text-base outline-none focus:border-primary"
                >
                  <option value="" disabled>Select a category</option>
                  {form.category && !categories.includes(form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-2 md:col-span-1 space-y-3">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Inventory</Label>
                <Input type="number" required min="0" value={form.inventory} onChange={e => setForm({...form, inventory: e.target.value})} className="h-11 bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base" />
              </div>

              <div className="space-y-3">
                 <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sale Price (EUR)</Label>
                <Input type="number" required min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-11 bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base" />
              </div>
              
              <div className="space-y-3">
                  <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Original Price (EUR) <span className="font-normal opacity-50">(Optional)</span></Label>
                <Input type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={e => setForm({...form, compareAtPrice: e.target.value})} className="h-11 bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base placeholder:text-muted-foreground/30" />
              </div>

              <div className="col-span-2 space-y-3">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Short Description</Label>
                <Textarea required maxLength={240} value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} placeholder="A concise summary for product cards and search results." className="min-h-[80px] bg-transparent border border-border rounded-none focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary p-3 text-sm font-light resize-y" />
                <p className="text-[10px] text-muted-foreground text-right">{form.shortDescription.length}/240</p>
              </div>

              <div className="col-span-2 space-y-3">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Full Description</Label>
                <Textarea required value={form.longDescription} onChange={e => setForm({...form, longDescription: e.target.value, description: e.target.value})} placeholder="The complete product details shown on the product page." className="min-h-[150px] bg-transparent border border-border rounded-none focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary p-3 text-sm font-light resize-y" />
              </div>
              
              <div className="col-span-2">
                <ImageUpload value={form.imageUrl} onChange={url => setForm({...form, imageUrl: url})} />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Badge Text <span className="font-normal opacity-50">(Optional)</span></Label>
                <Input value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} placeholder="e.g. 50% OFF" className="h-11 bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base placeholder:text-muted-foreground/30" />
              </div>

              <div className="col-span-2 md:col-span-1 flex items-start gap-4 p-5 border border-border bg-muted/10">
                <input 
                  type="checkbox" 
                  id="featured" 
                  checked={form.featured} 
                  onChange={e => setForm({...form, featured: e.target.checked})}
                  className="mt-1 w-4 h-4 border-border text-primary focus:ring-primary rounded-none bg-transparent"
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  <span className="block font-medium mb-1">Curated Selection</span>
                  <span className="block text-xs font-light text-muted-foreground">Highlight this piece on the storefront.</span>
                </Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-border">
              <Button type="button" variant="outline" className="h-12 px-8 text-xs uppercase tracking-widest font-semibold rounded-none" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending || !form.imageUrl} className="h-12 px-8 text-xs uppercase tracking-widest font-semibold rounded-none">
                {(createProduct.isPending || updateProduct.isPending) && <Loader2 className="h-4 w-4 mr-3 animate-spin" />}
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default function Admin() {
  return (
    <>
      <Show when="signed-in">
        <AdminAccessGate />
      </Show>
      <Show when="signed-out">
        <AdminSignedOutEntry />
      </Show>
    </>
  )
}

function AdminSignIn() {
  const [email, setEmail] = useState("support@weareclearance.com")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/test-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Could not sign in.")
      window.location.reload()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-12">
      <section className="w-full border border-border bg-[#fbfaf7] px-4 py-8 md:px-8 md:py-10">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-700">Temporary private access</p>
          <h1 className="mt-3 font-display text-3xl text-foreground md:text-4xl">Administrator sign in</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Enter the owner email address and the temporary testing password to access the We Are Clearance dashboard.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-5 border border-border bg-white p-6 md:p-8">
          <div className="space-y-2">
            <Label htmlFor="test-admin-email" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Email address</Label>
            <Input
              id="test-admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="rounded-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-admin-password" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Password</Label>
            <Input
              id="test-admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="rounded-none"
            />
          </div>
          {error && <p role="alert" className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
          <Button type="submit" className="h-12 w-full rounded-none text-xs font-semibold uppercase tracking-widest" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in to Admin
          </Button>
        </form>
      </section>
    </main>
  )
}

function AdminSignedOutEntry() {
  const [testSessionState, setTestSessionState] = useState<"checking" | "active" | "inactive">("checking")

  useEffect(() => {
    fetch("/api/admin/test-session", { credentials: "include" })
      .then((response) => response.json())
      .then((body) => setTestSessionState(body.authenticated ? "active" : "inactive"))
      .catch(() => setTestSessionState("inactive"))
  }, [])

  if (testSessionState === "active") return <AdminAccessGate temporarySession />
  if (testSessionState === "checking") {
    return (
      <main className="container mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-12">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Preparing Administrator sign in…
        </div>
      </main>
    )
  }
  return <AdminSignIn />
}

function AdminAccessGate({ temporarySession = false }: { temporarySession?: boolean }) {
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const [adminAccess, setAdminAccess] = useState<AdminAccess | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSignOut = async () => {
    if (temporarySession) {
      await fetch("/api/admin/test-logout", { method: "POST", credentials: "include" }).catch(() => undefined)
    }
    await signOut({ redirectUrl: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" })
  }

  useEffect(() => {
    let active = true
    const loadAccess = async () => {
      try {
        const token = await getToken()
        const response = await fetch("/api/admin/access", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || "This account does not have Administrator access.")
        if (active) setAdminAccess(body)
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Administrator access could not be verified.")
      }
    }
    loadAccess()
    return () => {
      active = false
    }
  }, [getToken])

  if (adminAccess) return <AdminContent initialAdminAccess={adminAccess} onSignOut={handleSignOut} />

  return (
    <main className="container mx-auto flex min-h-[60vh] max-w-2xl items-center px-4 py-12">
      <section className="w-full border border-border bg-white p-8 md:p-12">
        {error ? (
          <>
            <h1 className="font-display text-3xl">Administrator access required</h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{error}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Ask the primary owner to add your email address before signing in again.</p>
            <Button className="mt-8 rounded-none" onClick={handleSignOut}>
              Sign out
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking Administrator access…
          </div>
        )}
      </section>
    </main>
  )
}
