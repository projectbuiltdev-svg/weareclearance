import { useState, useRef, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { 
  useListProducts, 
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
  Plus, Edit2, Trash2, Loader2, LogOut, Search
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/lib/currency"
import { Show, useClerk } from "@clerk/react"
import { Redirect } from "wouter"
import { CsvImport } from "@/components/admin/csv-import"
import { ImageUpload } from "@/components/admin/image-upload"

function AdminContent() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { formatPrice } = useCurrency()
  const { signOut } = useClerk()
  
  const { data: summary, isLoading: isLoadingSummary } = useGetAdminSummary({ query: { queryKey: ["/api/admin/summary"] } })
  
  const [searchInputValue, setSearchInputValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  
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
          
          <Button className="h-12 px-6 uppercase tracking-widest text-xs font-semibold rounded-none" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-3" />
            New Product
          </Button>
          
          <Button variant="outline" className="h-12 px-6 uppercase tracking-widest text-xs font-semibold rounded-none ml-auto border-border bg-white hover:bg-muted" onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" })}>
            <LogOut className="h-4 w-4 mr-3 opacity-70" />
            Sign Out
          </Button>
        </div>
      </div>

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
                <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Category</Label>
                <Input required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="h-11 bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base" />
              </div>
              
              <div className="col-span-2 md:col-span-1 space-y-3">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Inventory</Label>
                <Input type="number" required min="0" value={form.inventory} onChange={e => setForm({...form, inventory: e.target.value})} className="h-11 bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base" />
              </div>

              <div className="space-y-3">
                 <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Price</Label>
                <Input type="number" required min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-11 bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base" />
              </div>
              
              <div className="space-y-3">
                 <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Compare At Price <span className="font-normal opacity-50">(Optional)</span></Label>
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
        <AdminContent />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  )
}
