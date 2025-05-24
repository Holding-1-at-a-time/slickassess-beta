"use client"
import { useAuth } from "@/lib/auth/AuthContext"

export default function LogoutButton() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      // Redirect is handled in the AuthContext
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <button onClick={handleLogout} className="text-sm font-medium text-gray-700 hover:text-gray-900">
      Sign out
    </button>
  )
}
