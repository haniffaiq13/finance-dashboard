// lib/rbac.ts — NON-JSX (aman di .ts)
import React, { ComponentType } from "react"
import { Role, Permission, Resource } from "@/types"

// =====================
// PERMISSIONS MATRIX
// =====================
const PERMISSIONS: Record<Role, Record<Resource, Permission[]>> = {
  admin: {
    TRANSACTION: ["CREATE", "READ", "UPDATE", "DELETE"],
    MEMBER: ["CREATE", "READ", "UPDATE", "DELETE"],
    CHART: ["CREATE", "READ", "UPDATE", "DELETE"],
    EXPORT: ["CREATE", "READ", "UPDATE", "DELETE"],
  },
  finance: {
    TRANSACTION: ["CREATE", "READ", "UPDATE", "DELETE"],
    MEMBER: ["READ"],
    CHART: ["READ"],
    EXPORT: ["CREATE", "READ"],
  },
  writer: {
    TRANSACTION: ["READ"],
    MEMBER: ["CREATE", "READ", "UPDATE", "DELETE"],
    CHART: ["READ"],
    EXPORT: ["READ"],
  },
  user: {
    TRANSACTION: ["READ"],
    MEMBER: ["READ"],
    CHART: ["READ"],
    EXPORT: [],
  },
}

// =====================
// CORE CHECKER
// =====================
export const can = (role: Role, permission: Permission, resource: Resource): boolean => {
  const rolePermissions = PERMISSIONS[role]
  if (!rolePermissions) return false
  const resourcePermissions = rolePermissions[resource]
  return Array.isArray(resourcePermissions) ? resourcePermissions.includes(permission) : false
}

// =====================
// HELPERS
// =====================
export const canCreateTransaction = (role: Role): boolean => can(role, "CREATE", "TRANSACTION")

// EDIT biasanya butuh UPDATE; DELETE itu aksi terpisah. Kalau lu memang mau keduanya, biarkan.
export const canEditTransaction = (role: Role): boolean =>
  can(role, "UPDATE", "TRANSACTION") && can(role, "DELETE", "TRANSACTION")

export const canCreateMember = (role: Role): boolean => can(role, "CREATE", "MEMBER")

export const canEditMember = (role: Role): boolean =>
  can(role, "UPDATE", "MEMBER") && can(role, "DELETE", "MEMBER")

export const canExportData = (role: Role): boolean => can(role, "CREATE", "EXPORT")

// =====================
// SESSION ROLE (mock)
// =====================
// Ubah ini sesuai store lu (Zustand/Context). Untuk demo: ambil dari localStorage: { user: { role } }
function getCurrentRole(): Role | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("session")
    if (!raw) return null
    const obj = JSON.parse(raw)
    return obj?.user?.role ?? null
  } catch {
    return null
  }
}

// =====================
// ROUTE GUARD (HOC) — NO JSX
// =====================
export function withAuth<P>(allowedRoles: Role[]) {
  return function (WrappedComponent: ComponentType<P>) {
    const AuthenticatedComponent: React.FC<P> = (props: P) => {
      const role = getCurrentRole()
      if (!role || !allowedRoles.includes(role)) {
        // return null / fragment kosong / atau render komponen NotAuthorized versi lu
        return React.createElement(React.Fragment, null)
      }
      return React.createElement(WrappedComponent, { ...props })
    }
    AuthenticatedComponent.displayName = `WithAuth(${(WrappedComponent as any).displayName || WrappedComponent.name || "Component"})`
    return AuthenticatedComponent
  }
}

// =====================
// NAV ITEMS
// =====================
type NavItem = { href: string; label: string; icon: string }

export const getNavigationItems = (role: Role): NavItem[] => {
  const baseItems: NavItem[] = [{ href: "/", label: "Dashboard", icon: "BarChart3" }]

  // Semua role boleh lihat Keuangan (read-only utk non-BENDAHARA)
  const roleItems: NavItem[] = [
    { href: "/keuangan", label: "Keuangan", icon: "DollarSign" },
    { href: "/anggota", label: "Anggota", icon: "Users" }, // CRUD hanya Sekretaris
  ]

  const endItems: NavItem[] = [{ href: "/profile", label: "Profile", icon: "User" }]

  return [...baseItems, ...roleItems, ...endItems]
}
