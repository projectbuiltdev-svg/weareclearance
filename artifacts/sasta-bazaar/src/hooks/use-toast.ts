import { toast as sonnerToast } from "sonner"

export function useToast() {
  return {
    toast: ({ title, description, variant, duration }: { title: string, description?: string, variant?: "default" | "destructive" | "accent", duration?: number }) => {
      const options = { description, duration }
      if (variant === 'destructive') {
        sonnerToast.error(title, options)
      } else {
        sonnerToast.success(title, options)
      }
    }
  }
}
