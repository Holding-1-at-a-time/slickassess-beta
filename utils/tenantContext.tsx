"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useParams } from "next/navigation"

interface TenantContextType {
  tenantId: string
}

const TenantContext = createContext<TenantContextType | null>(null)

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const params = useParams<{ tenantId: string }>()
  const tenantId = params.tenantId

  if (!tenantId) {
    throw new Error("TenantProvider must be used within a route with a tenantId parameter")
  }

  return <TenantContext.Provider value={{ tenantId }}>{children}</TenantContext.Provider>
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext)

  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider")
  }

  return context
}
