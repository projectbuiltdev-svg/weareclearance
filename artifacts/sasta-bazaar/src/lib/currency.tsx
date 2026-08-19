import React, { createContext, useContext, useEffect, useState } from "react"

export type Currency = "£" | "€"

type CurrencyContextValue = {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convertPrice: (euroPrice: number) => number
  formatPrice: (euroPrice: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined)
const GBP_PER_EUR = 0.86

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window === "undefined") return "€"
    return window.localStorage.getItem("sasta-bazaar-currency") === "£" ? "£" : "€"
  })

  useEffect(() => {
    window.localStorage.setItem("sasta-bazaar-currency", currency)
  }, [currency])

  const convertPrice = (euroPrice: number) => (currency === "£" ? euroPrice * GBP_PER_EUR : euroPrice)
  const formatPrice = (euroPrice: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency === "£" ? "GBP" : "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertPrice(euroPrice))

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider")
  return context
}