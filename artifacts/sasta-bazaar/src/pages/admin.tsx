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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Package, LayoutGrid, AlertTriangle, Upload, 
  Plus, Edit2, Trash2, Euro, Loader2
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
    if (confirm("Are you sure you want to delete this item?")) {
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
            toast({ title: `Imported ${res.imported} products!` })
            invalidateData()
          },
          onError: (err) => {
            toast({ title: "Import failed", variant: "destructive" })
          }
        })
      } catch (err) {
        toast({ title: "Failed to parse CSV", variant: "destructive" })
      }
    }
    reader.readAsText(file)
    // reset input
    e.target.value = ''
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-tight">Dukan Manager</h1>
          <p className="text-muted-foreground font-medium">Manage your catalogue, stock, and prices.</p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="csv-upload" className="cursor-pointer">
            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-6 py-2 border-2 border-primary text-primary bg-background hover:bg-primary hover:text-primary-foreground uppercase tracking-wide">
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
          
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      {isLoadingSummary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg bazaar-border" />)}
        </div>
      ) : summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg bazaar-border border-l-8 border-l-primary flex flex-col justify-center">
            <div className="flex items-center text-muted-foreground font-bold mb-1">
              <Package className="h-4 w-4 mr-2" /> Total Items
            </div>
            <div className="text-3xl font-display font-black">{summary.totalProducts}</div>
          </div>
          <div className="bg-card p-4 rounded-lg bazaar-border border-l-8 border-l-secondary flex flex-col justify-center">
            <div className="flex items-center text-muted-foreground font-bold mb-1">
              <LayoutGrid className="h-4 w-4 mr-2" /> Categories
            </div>
            <div className="text-3xl font-display font-black">{summary.categories}</div>
          </div>
          <div className="bg-card p-4 rounded-lg bazaar-border border-l-8 border-l-accent flex flex-col justify-center">
            <div className="flex items-center text-muted-foreground font-bold mb-1">
              <Upload className="h-4 w-4 mr-2" /> Featured
            </div>
            <div className="text-3xl font-display font-black">{summary.featuredProducts}</div>
          </div>
          <div className="bg-card p-4 rounded-lg bazaar-border border-l-8 border-l-destructive flex flex-col justify-center">
            <div className="flex items-center text-destructive font-bold mb-1">
              <AlertTriangle className="h-4 w-4 mr-2" /> Low Stock
            </div>
            <div className="text-3xl font-display font-black text-destructive">{summary.lowStockProducts}</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl bazaar-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b-4 border-border">
                <th className="p-4 font-black uppercase text-sm">Item</th>
                <th className="p-4 font-black uppercase text-sm">Category</th>
                <th className="p-4 font-black uppercase text-sm">Price</th>
                <th className="p-4 font-black uppercase text-sm">Stock</th>
                <th className="p-4 font-black uppercase text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingProducts ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    Loading catalogue...
                  </td>
                </tr>
              ) : products?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground font-bold">
                    No items in catalogue yet. Add one!
                  </td>
                </tr>
              ) : (
                products?.map(p => (
                  <tr key={p.id} className="border-b-2 border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold">{p.name}</div>
                      {p.badge && <Badge variant="secondary" className="mt-1 text-[10px]">{p.badge}</Badge>}
                    </td>
                    <td className="p-4 font-medium text-muted-foreground">{p.category}</td>
                    <td className="p-4 font-bold text-primary flex items-center">
                      <Euro className="h-4 w-4" />{p.price.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <Badge variant={p.inventory < 5 ? "destructive" : "outline"} className="font-mono">
                        {p.inventory} in stock
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(p)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display font-black text-2xl uppercase">
              {editingProduct ? 'Edit Item' : 'New Item'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Name</Label>
                <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Category</Label>
                <Input required value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                 <Label>Price (€)</Label>
                <Input type="number" required min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <Label>Compare At Price (€)</Label>
                <Input type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={e => setForm({...form, compareAtPrice: e.target.value})} placeholder="Optional" />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label>Image URL</Label>
                <Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" required min="0" value={form.inventory} onChange={e => setForm({...form, inventory: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} placeholder="e.g. 50% OFF" />
              </div>

              <div className="space-y-2 col-span-2 flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="featured" 
                  checked={form.featured} 
                  onChange={e => setForm({...form, featured: e.target.checked})}
                  className="w-4 h-4 rounded border-2 border-input text-primary focus:ring-primary"
                />
                <Label htmlFor="featured" className="cursor-pointer">Show in Featured/Dhamaka Sale section</Label>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-2 border-t-2 border-border mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                {(createProduct.isPending || updateProduct.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProduct ? 'Save Changes' : 'Add Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
