import { useState } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Upload, FileDown, CheckCircle2, XCircle } from "lucide-react"
import { useImportProducts } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"

const canonicalHeaders: Record<string, string> = {
  sku: "sku",
  name: "name",
  shortdescription: "shortDescription",
  description: "longDescription",
  longdescription: "longDescription",
  category: "category",
  price: "price",
  compareatprice: "compareAtPrice",
  inventory: "inventory",
  imageurl: "imageUrl",
  badge: "badge",
  featured: "featured",
}

interface CsvImportProps {
  onSuccess: () => void;
}

export function CsvImport({ onSuccess }: CsvImportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  
  const { toast } = useToast()
  const importProducts = useImportProducts()

  const handleDownloadDemo = () => {
    const csvContent = `sku,name,shortDescription,longDescription,category,price,compareAtPrice,inventory,imageUrl,badge,featured
SKU-1001,Mid-Century Leather Armchair,Premium leather statement seating.,An authentic reproduction of a classic 1950s design featuring premium top-grain leather and a supportive hardwood frame.,Furniture,450.00,899.00,12,https://example.com/chair.jpg,50% OFF,true
SKU-1002,Brushed Brass Desk Lamp,Adjustable brass task lighting.,Elegant and minimal task lighting with an adjustable head and warm brushed finish for desks and bedside tables.,Lighting,85.00,,45,https://example.com/lamp.jpg,,false`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "clearance_demo_products.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => canonicalHeaders[h.trim().toLowerCase().replace(/[\s_-]/g, "")] || h.trim(),
      complete: (results) => {
        const parsedData = results.data as any[]
        const validationErrors: string[] = results.errors.map((error) =>
          `Row ${(error.row ?? 0) + 2}: ${error.message}`,
        )
        const skus = new Set<string>()

        const formattedData = parsedData.map((row, i) => {
          const rowNum = i + 2
          
          // Normalize boolean values
          let featured = false
          const fStr = String(row.featured).toLowerCase().trim()
          if (fStr === 'true' || fStr === '1') featured = true
          
          // Check required fields
          if (!row.name?.trim()) validationErrors.push(`Row ${rowNum}: Name is required`)
          if (!row.shortDescription?.trim()) validationErrors.push(`Row ${rowNum}: Short description is required`)
          if (!row.longDescription?.trim()) validationErrors.push(`Row ${rowNum}: Long description is required`)
          if (!row.category?.trim()) validationErrors.push(`Row ${rowNum}: Category is required`)
          if (!row.price || isNaN(parseFloat(row.price))) validationErrors.push(`Row ${rowNum}: Price is invalid or missing`)
          if (!row.inventory || isNaN(parseInt(row.inventory))) validationErrors.push(`Row ${rowNum}: Inventory is invalid or missing`)
          if (!row.imageUrl?.trim()) validationErrors.push(`Row ${rowNum}: Image URL is required`)

          const sku = row.sku?.trim().toUpperCase()
          if (sku) {
            if (skus.has(sku)) {
              validationErrors.push(`Row ${rowNum}: Duplicate SKU inside file (${sku})`)
            }
            skus.add(sku)
          }

          return {
            sku: sku || undefined,
            name: row.name?.trim(),
            shortDescription: row.shortDescription?.trim(),
            longDescription: row.longDescription?.trim(),
            category: row.category?.trim(),
            price: parseFloat(row.price),
            compareAtPrice: row.compareAtPrice ? parseFloat(row.compareAtPrice) : undefined,
            inventory: parseInt(row.inventory),
            imageUrl: row.imageUrl?.trim(),
            badge: row.badge?.trim() || undefined,
            featured
          }
        })

        setErrors(validationErrors)
        setPreview(formattedData)
      },
      error: () => {
        setErrors(["Failed to parse the CSV file."])
        setPreview([])
      }
    })
    
    e.target.value = ''
  }

  const handleImport = () => {
    if (errors.length > 0 || preview.length === 0) return

    importProducts.mutate({ data: { products: preview as any } }, {
      onSuccess: (res) => {
        toast({ title: `Successfully imported ${res.imported} products` })
        setIsOpen(false)
        setFile(null)
        setPreview([])
        onSuccess()
      },
      onError: (err: any) => {
        toast({ 
          title: "Import failed", 
          description: err.message || "Please check your CSV format and try again.",
          variant: "destructive" 
        })
      }
    })
  }

  return (
    <>
      <Button variant="outline" className="h-12 px-6 uppercase tracking-widest text-xs font-semibold rounded-none" onClick={() => setIsOpen(true)}>
        <Upload className="h-4 w-4 mr-3 opacity-70" />
        Import CSV
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          setFile(null)
          setPreview([])
          setErrors([])
        }
      }}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white border border-border rounded-none">
          <DialogHeader className="px-8 py-6 border-b border-border bg-muted/20">
            <DialogTitle className="font-display italic text-2xl">
              Import Catalogue
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Field Guide */}
            {!file && (
              <div className="space-y-4">
                <div className="bg-muted/30 border border-border p-5 text-sm font-light text-muted-foreground leading-relaxed">
                  <h4 className="font-semibold text-foreground uppercase tracking-widest text-xs mb-3">CSV Field Guide</h4>
                  <ul className="space-y-2 list-disc pl-4 mb-4">
                    <li><strong className="text-foreground">Required:</strong> name, shortDescription, longDescription, category, price, inventory, imageUrl</li>
                    <li><strong className="text-foreground">Optional:</strong> sku, compareAtPrice, badge, featured (true/false)</li>
                  </ul>
                  <p>
                    If <strong className="text-foreground">sku</strong> is left blank, a unique one will be automatically generated.
                    Importing a row with an existing SKU will update the matching product.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleDownloadDemo} className="rounded-none flex-1">
                    <FileDown className="h-4 w-4 mr-2" />
                    Download Demo CSV
                  </Button>
                  
                  <div className="flex-1">
                    <input 
                      type="file" 
                      id="csv-file-upload" 
                      accept=".csv" 
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                    <Button asChild className="w-full rounded-none">
                      <label htmlFor="csv-file-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Select CSV File
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview State */}
            {file && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{file.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="h-8 text-xs rounded-none">Cancel</Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/20 border border-border p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-display mb-1">{preview.length}</span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Total Rows</span>
                  </div>
                  <div className={`border p-4 flex flex-col items-center justify-center text-center ${errors.length > 0 ? 'bg-destructive/10 border-destructive/30' : 'bg-green-50 border-green-200'}`}>
                    <span className={`text-3xl font-display mb-1 ${errors.length > 0 ? 'text-destructive' : 'text-green-700'}`}>{errors.length}</span>
                    <span className={`text-[10px] uppercase tracking-widest font-semibold ${errors.length > 0 ? 'text-destructive' : 'text-green-700'}`}>Validation Errors</span>
                  </div>
                </div>

                {errors.length > 0 ? (
                  <div className="bg-destructive/10 text-destructive p-4 border border-destructive/20 text-sm">
                    <div className="flex items-center gap-2 font-semibold mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Please fix these issues to continue:
                    </div>
                    <ul className="list-disc pl-5 space-y-1 font-light max-h-40 overflow-y-auto">
                      {errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-green-50 text-green-800 p-4 border border-green-200 text-sm flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5" />
                    All rows are valid and ready to be imported.
                  </div>
                )}

                {preview.length > 0 && (
                  <div className="border border-border overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-xs">
                      <thead className="bg-muted/30 border-b border-border">
                        <tr>
                          <th className="px-3 py-3 uppercase tracking-widest text-[9px]">Row</th>
                          <th className="px-3 py-3 uppercase tracking-widest text-[9px]">SKU</th>
                          <th className="px-3 py-3 uppercase tracking-widest text-[9px]">Product</th>
                          <th className="px-3 py-3 uppercase tracking-widest text-[9px]">Category</th>
                          <th className="px-3 py-3 uppercase tracking-widest text-[9px]">Price</th>
                          <th className="px-3 py-3 uppercase tracking-widest text-[9px]">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {preview.slice(0, 20).map((row, index) => (
                          <tr key={`${row.sku || "generated"}-${index}`}>
                            <td className="px-3 py-3 text-muted-foreground">{index + 2}</td>
                            <td className="px-3 py-3 font-mono">{row.sku || "Auto-generate"}</td>
                            <td className="px-3 py-3 max-w-[220px] truncate">{row.name}</td>
                            <td className="px-3 py-3">{row.category}</td>
                            <td className="px-3 py-3">£{Number(row.price).toFixed(2)}</td>
                            <td className="px-3 py-3">{row.inventory}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {preview.length > 20 && (
                      <p className="px-3 py-3 border-t border-border text-muted-foreground">
                        Showing the first 20 of {preview.length} rows.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {file && (
            <div className="px-8 py-4 border-t border-border bg-muted/10 flex justify-end gap-3">
              <Button type="button" disabled={errors.length > 0 || importProducts.isPending} onClick={handleImport} className="rounded-none h-12 px-8 uppercase tracking-widest text-xs font-semibold">
                {importProducts.isPending ? 'Importing...' : 'Import Catalogue'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
