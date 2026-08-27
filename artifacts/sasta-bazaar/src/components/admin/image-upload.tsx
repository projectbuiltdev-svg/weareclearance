import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Image as ImageIcon, UploadCloud, Loader2, X } from "lucide-react"
import imageCompression from "browser-image-compression"
import { useRequestUploadUrl } from "@workspace/api-client-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { toast } = useToast()
  const requestUrl = useRequestUploadUrl()

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true)
      
      // 1. Compress
      const options = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
      }
      const compressedFile = await imageCompression(file, options)
      
      // 2. Request URL
      const contentType = "image/webp" as const;
      const res = await requestUrl.mutateAsync({
        data: {
          name: compressedFile.name.replace(/\.[^/.]+$/, "") + ".webp",
          size: compressedFile.size,
          contentType,
        }
      })
      
      // 3. Upload to signed URL
      const uploadRes = await fetch(res.uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: compressedFile
      })
      
      if (!uploadRes.ok) {
        throw new Error("Failed to upload image to storage")
      }
      
      // 4. Set final URL
      onChange(res.imageUrl)
      toast({ title: "Image uploaded successfully" })
    } catch (err: any) {
      console.error(err)
      toast({ title: "Upload failed", description: err.message || "An error occurred", variant: "destructive" })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }
  
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }
  
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-3">
          <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Image URL</Label>
          <Input 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder="https://..." 
            className="h-11 bg-transparent border-b border-0 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-base placeholder:text-muted-foreground/30" 
          />
        </div>
      </div>
      
      <div 
        className={`relative border-2 border-dashed ${dragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/10'} transition-colors p-8 text-center`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={onFileChange} 
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Uploading & Compressing...</p>
          </div>
        ) : value ? (
          <div className="relative group mx-auto w-fit">
            <img src={value} alt="Preview" className="max-h-48 object-contain" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <Button size="sm" variant="secondary" className="rounded-none text-xs uppercase tracking-wider" onClick={() => fileInputRef.current?.click()}>
                Replace
              </Button>
              <Button size="icon" variant="destructive" className="rounded-none h-9 w-9" onClick={(e) => { e.stopPropagation(); onChange("") }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-10 w-10 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Click to upload or drag and drop</p>
              <p className="text-xs font-light text-muted-foreground">PNG, JPG or WebP (max 1.5MB)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
