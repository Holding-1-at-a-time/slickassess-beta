"use client"

import { type ReactNode, useState } from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { Car, ClipboardCheck, Calendar, DollarSign, Settings, Menu, X, LogOut, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const params = useParams()
  const pathname = usePathname()
  const tenantId = params.tenantId as string

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    {
      name: "Dashboard",
      href: `/${tenantId}/dashboard`,
      icon: ClipboardCheck,
      current: pathname === `/${tenantId}/dashboard`,
    },
    {
      name: "Vehicles",
      href: `/${tenantId}/dashboard/vehicles`,
      icon: Car,
      current: pathname.startsWith(`/${tenantId}/dashboard/vehicles`),
    },
    {
      name: "Assessments",
      href: `/${tenantId}/dashboard/assessments`,
      icon: ClipboardCheck,
      current: pathname.startsWith(`/${tenantId}/dashboard/assessments`),
    },
    {
      name: "Bookings",
      href: `/${tenantId}/dashboard/bookings`,
      icon: Calendar,
      current: pathname.startsWith(`/${tenantId}/dashboard/bookings`),
    },
    {
      name: "Pricing",
      href: `/${tenantId}/dashboard/pricing`,
      icon: DollarSign,
      current: pathname === `/${tenantId}/dashboard/pricing`,
    },
    {
      name: "Settings",
      href: `/${tenantId}/dashboard/settings`,
      icon: Settings,
      current: pathname === `/${tenantId}/dashboard/settings`,
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-border bg-card pt-5">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href={`/${tenantId}/dashboard`} className="font-bold text-xl">
              SlickAssess
            </Link>
          </div>
          <div className="mt-5 flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${item.current ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5
                      ${item.current ? "text-primary-foreground" : "text-muted-foreground"}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden absolute top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <Link href={`/${tenantId}/dashboard`} className="font-bold text-xl">
                SlickAssess
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${item.current ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5
                      ${item.current ? "text-primary-foreground" : "text-muted-foreground"}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-card border-b border-border">
          <div className="flex-1 px-4 flex justify-end">
            <div className="ml-4 flex items-center md:ml-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href={`/${tenantId}/dashboard/settings`} className="flex w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button className="flex w-full items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">{children}</main>
      </div>
    </div>
  )
}
