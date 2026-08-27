import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { 
  useListProducts, 
  useGetAdminSummary, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct, 
  useImportProducts,
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
  Plus, Edit2, Trash2, PoundSterling, Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Admin() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const { data: summary, isLoading: isLoadingSummary } = useGetAdminSummary({ query: { queryKey: ["/api/admin/summary"] } })
  const { data: products, isLoading: isLoadingProducts } = useListProducts(undefined, { query: { queryKey: ["/api/products"] } })
  
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  const importProducts = useImportProducts()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  type ProductForm = Omit<ProductInput, "price" | "inventory" | "compareAtPrice" | "badge"> & {
    price: string
    inventory: string
    compareAtPrice: string
    badge: string
  }
  const defaultForm: ProductForm = {
    name: "", description: "", category: "", price: "", 
    compareAtPrice: "", imageUrl: "", badge: "", featured: false, inventory: "10"
  }
  const [form, setForm] = useState(defaultForm)

  const handleOpenDialog = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product)
      setForm({
        name: product.name,
        description: product.description,
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
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() })
    queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() })
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      inventory: Number(form.inventory),
      badge: form.badge || null,
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(l => l.trim())
        if (lines.length < 2) return
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const importedProducts = lines.slice(1).map(line => {
           // Basic CSV parsing (doesn't handle quotes properly, but sufficient for simple cases)
           const values = line.split(',').map(v => v.trim())
           const p: any = {}
           headers.forEach((h, i) => { p[h] = values[i] })
           return {
             name: p.name || 'Unknown Item',
             description: p.description || '',
             category: p.category || 'General',
             price: parseFloat(p.price) || 0,
             compareAtPrice: p.compareatprice ? parseFloat(p.compareatprice) : null,
             imageUrl: p.imageurl || '',
             badge: p.badge || null,
             featured: p.featured === 'true' || p.featured === '1',
             inventory: parseInt(p.inventory) || 10
           }
        })

        importProducts.mutate({ data: { products: importedProducts } }, {
          onSuccess: (res) => {
            toast({ title: `Successfully imported ${res.imported} products` })
            invalidateData()
          },
          onError: () => {
            toast({ title: "Import failed. Please check your CSV format.", variant: "destructive" })
          }
        })
      } catch (err) {
        toast({ title: "Failed to parse CSV file", variant: "destructive" })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 space-y-8 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight mb-1">Store Administration</h1>
          <p className="text-sm text-muted-foreground font-medium">Manage your catalogue, stock levels, and pricing.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Label htmlFor="csv-upload" className="cursor-pointer">
            <div className="inline-flex items-center justify-center rounded-md text-sm font-semibold h-10 px-5 border-2 border-dashed border-primary/50 text-primary hover:border-primary hover:bg-primary/5 transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </div>
            <input 
              id="csv-upload" 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </Label>
          
          <Button className="h-10 px-6 font-bold shadow-sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      {isLoadingSummary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white animate-pulse rounded-xl border border-border" />)}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Package className="h-12 w-12" />
            </div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Total Products</div>
            <div className="text-4xl font-display font-bold text-foreground">{summary.totalProducts}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <LayoutGrid className="h-12 w-12" />
            </div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Categories</div>
            <div className="text-4xl font-display font-bold text-foreground">{summary.categories}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-accent">
              <Upload className="h-12 w-12" />
            </div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Featured</div>
            <div className="text-4xl font-display font-bold text-accent">{summary.featuredProducts}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-destructive">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <div className="text-sm font-bold text-destructive uppercase tracking-wider mb-2">Low Stock</div>
            <div className="text-4xl font-display font-bold text-destructive">{summary.lowStockProducts}</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 font-bold text-muted-foreground">Product</th>
                <th className="px-6 py-4 font-bold text-muted-foreground">Category</th>
                <th className="px-6 py-4 font-bold text-muted-foreground">Price</th>
                <th className="px-6 py-4 font-bold text-muted-foreground">Stock</th>
                <th className="px-6 py-4 font-bold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingProducts ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="font-medium">Loading catalogue...</p>
                  </td>
                </tr>
              ) : products?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-semibold text-lg">No products found</p>
                    <p>Add your first product to get started.</p>
                  </td>
                </tr>
              ) : (
                products?.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground max-w-[250px] truncate" title={p.name}>{p.name}</div>
                      {p.badge && <Badge className="mt-1.5 text-[10px] bg-accent/10 text-accent hover:bg-accent/20 border-none shadow-none">{p.badge}</Badge>}
                    </td>
                    <td className="px-6 py-4 font-medium text-muted-foreground">{p.category}</td>
                    <td className="px-6 py-4 font-bold">
                      <span className="flex items-center">
                        <PoundSterling className="h-3.5 w-3.5 mr-0.5 opacity-60" />{p.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.inventory < 5 ? "destructive" : "outline"} className={`font-mono ${p.inventory >= 5 ? 'border-border text-muted-foreground' : ''}`}>
                        {p.inventory} units
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleOpenDialog(p)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-1" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-4 w-4" />
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
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white">
          <DialogHeader className="px-6 py-5 border-b border-border bg-muted/30">
            <DialogTitle className="font-display font-bold text-xl">
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 md:col-span-1 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Name</Label>
                <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-11 bg-muted/50 focus-visible:bg-white" />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                <Input required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="h-11 bg-muted/50 focus-visible:bg-white" />
              </div>
              
              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price (£)</Label>
                <Input type="number" required min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="h-11 bg-muted/50 focus-visible:bg-white" />
              </div>
              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">RRP / Compare At (£)</Label>
                <Input type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={e => setForm({...form, compareAtPrice: e.target.value})} placeholder="Optional" className="h-11 bg-muted/50 focus-visible:bg-white" />
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="min-h-[100px] bg-muted/50 focus-visible:bg-white resize-none" />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Image URL</Label>
                <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." className="h-11 bg-muted/50 focus-visible:bg-white" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock Level</Label>
                <Input type="number" required min="0" value={form.inventory} onChange={e => setForm({...form, inventory: e.target.value})} className="h-11 bg-muted/50 focus-visible:bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Badge Text</Label>
                <Input value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} placeholder="e.g. 50% OFF" className="h-11 bg-muted/50 focus-visible:bg-white" />
              </div>

              <div className="col-span-2 flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/20 mt-2">
                <input 
                  type="checkbox" 
                  id="featured" 
                  checked={form.featured} 
                  onChange={e => setForm({...form, featured: e.target.checked})}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 bg-white"
                />
                <Label htmlFor="featured" className="cursor-pointer font-semibold select-none">
                  Highlight this product in 'Customer Favourites'
                </Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
              <Button type="button" variant="outline" className="h-11 px-6 font-bold" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="h-11 px-8 font-bold">
                {(createProduct.isPending || updateProduct.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
