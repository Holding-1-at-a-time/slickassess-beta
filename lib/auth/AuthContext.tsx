"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"

interface User {
  _id: Id<"users">
  name: string
  email: string
  tenantId: string
  role: "admin" | "user"
  profileImageUrl?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, tenantId: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const loginMutation = useMutation(api.auth.login)
  const registerMutation = useMutation(api.auth.register)
  const logoutMutation = useMutation(api.auth.logout)

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
    return null
  }

  // Set token in localStorage
  const setToken = (token: string, expiresAt: number) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
      localStorage.setItem("token_expires", expiresAt.toString())
    }
  }

  // Remove token from localStorage
  const removeToken = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("token_expires")
    }
  }

  // Check if token is expired
  const isTokenExpired = () => {
    if (typeof window !== "undefined") {
      const expiresAt = localStorage.getItem("token_expires")
      if (expiresAt) {
        return Number.parseInt(expiresAt) < Date.now()
      }
    }
    return true
  }

  // Get current user
  const token = getToken()
  const currentUser = useQuery(api.auth.me, token ? { token } : "skip")

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)

      const token = getToken()

      if (token && !isTokenExpired()) {
        if (currentUser) {
          setUser(currentUser)
        }
      } else if (token) {
        // Token is expired, remove it
        removeToken()
        setUser(null)
      }

      setIsLoading(false)
    }

    initAuth()
  }, [currentUser])

  // Redirect to login if not authenticated and trying to access protected route
  useEffect(() => {
    if (!isLoading && !user) {
      const publicRoutes = ["/", "/sign-in", "/sign-up"]
      const isPublicRoute = publicRoutes.some((route) => pathname === route)

      if (!isPublicRoute) {
        router.push("/sign-in")
      }
    }
  }, [user, isLoading, pathname, router])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password })
      setToken(result.token, result.expiresAt)

      // Redirect to dashboard
      router.push(`/${result.tenantId}/dashboard`)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string, tenantId: string) => {
    try {
      const result = await registerMutation({ name, email, password, tenantId })
      setToken(result.token, result.expiresAt)

      // Redirect to dashboard
      router.push(`/${tenantId}/dashboard`)
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      const token = getToken()
      if (token) {
        await logoutMutation({ token })
      }
      removeToken()
      setUser(null)

      // Redirect to home
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
