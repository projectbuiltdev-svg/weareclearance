import React, { createContext, useContext, useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

export type Currency = "£" | "€"

type CurrencyContextValue = {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convertPrice: (euroPrice: number) => number
  formatPrice: (euroPrice: number) => string
  gbpPerEur: number
  refreshExchangeRate: () => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined)
const DEFAULT_GBP_PER_EUR = 0.86

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("€")
  const [storageReady, setStorageReady] = useState(false)
  const [gbpPerEur, setGbpPerEur] = useState(DEFAULT_GBP_PER_EUR)

  const refreshExchangeRate = async () => {
    try {
      const response = await apiFetch("/api/store-settings")
      if (!response.ok) return
      const settings = await response.json()
      if (typeof settings.gbpPerEur === "number" && settings.gbpPerEur > 0) setGbpPerEur(settings.gbpPerEur)
    } catch {
      // Keep the last known/default rate if the settings service is unavailable.
    }
  }

  useEffect(() => {
    setCurrency(window.localStorage.getItem("sasta-bazaar-currency") === "£" ? "£" : "€")
    setStorageReady(true)
    void refreshExchangeRate()
  }, [])

  useEffect(() => {
    if (!storageReady) return
    window.localStorage.setItem("sasta-bazaar-currency", currency)
  }, [currency, storageReady])

  const convertPrice = (euroPrice: number) => (currency === "£" ? euroPrice * gbpPerEur : euroPrice)
  const formatPrice = (euroPrice: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency === "£" ? "GBP" : "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertPrice(euroPrice))

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, formatPrice, gbpPerEur, refreshExchangeRate }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider")
  return context
}