// lib/auth.ts — FIXED, konsisten & persisten di localStorage
"use client"

import { User, AuthSession } from "@/types"
import usersSeed from "@/data/users.json"

// -----------------------------
// Normalisasi input
// -----------------------------
const normEmail = (email: string) => (email || "").trim().toLowerCase()
const normPassword = (password: string) => (password || "").trim()

// -----------------------------
// Hash MOCK (UNTUK DEMO SAJA)
// Konsisten dengan seed + login
// -----------------------------
// Versi kamu: `$2a$10$hash_${len}_${first3}`
// Gue tambahin prefix "h0:" biar kebaca jelas.
// Tetap kompatibel ke hash lama milik kamu.
const HASH_PREFIX = "h0:"
const mockHash = (password: string): string => {
  const p = normPassword(password)
  const h = `$2a$10$hash_${p.length}_${p.slice(0, 3)}`
  return `${HASH_PREFIX}${h}`
}

// Terima 3 kondisi untuk transisi mulus:
// 1) hash pake prefix h0:
// 2) hash lama kamu tanpa prefix (startsWith("$2a$10$hash_"))
// 3) seed plaintext (SANGAT TIDAK DISARANKAN, tapi ditoleransi sementara)
const verifyPassword = (password: string, stored: string): boolean => {
  const p = normPassword(password)
  if (!stored) return false
  if (stored.startsWith(HASH_PREFIX)) return mockHash(p) === stored
  if (stored.startsWith("$2a$10$hash_")) return `$2a$10$hash_${p.length}_${p.slice(0, 3)}` === stored
  // fallback plaintext
  return p === normPassword(stored)
}

// -----------------------------
// Token MOCK (base64 payload)
// -----------------------------
const encodeB64 = (s: string) =>
  typeof window !== "undefined"
    ? window.btoa(unescape(encodeURIComponent(s)))
    : Buffer.from(s, "utf8").toString("base64")

const decodeB64 = (s: string) =>
  typeof window !== "undefined"
    ? decodeURIComponent(escape(window.atob(s)))
    : Buffer.from(s, "base64").toString("utf8")

const createToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
  }
  return encodeB64(JSON.stringify(payload))
}

const parseToken = (token: string): { id: string; email: string; role: User["role"]; exp: number } | null => {
  try {
    return JSON.parse(decodeB64(token))
  } catch {
    return null
  }
}

// -----------------------------
// Storage helpers
// -----------------------------
const STORAGE_SESSION = "internal_auth_session"
const STORAGE_USERS = "internal_users" // pool user yang bisa diubah

const readLocalUsers = (): User[] => {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_USERS)
    return raw ? (JSON.parse(raw) as User[]) : []
  } catch {
    return []
  }
}

const writeLocalUsers = (users: User[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users))
}

// Gabung seed + local dengan kunci email (local override seed)
const getAllUsers = (): User[] => {
  const map = new Map<string, User>()
  ;(usersSeed as User[]).forEach((u) => map.set(normEmail(u.email), u))
  readLocalUsers().forEach((u) => map.set(normEmail(u.email), u))
  return Array.from(map.values())
}

const saveOrReplaceUser = (user: User) => {
  const local = readLocalUsers()
  const idx = local.findIndex((u) => normEmail(u.email) === normEmail(user.email))
  if (idx >= 0) local[idx] = user
  else local.push(user)
  writeLocalUsers(local)
}

// -----------------------------
// Session helpers
// -----------------------------
export const getStoredSession = (): AuthSession => {
  if (typeof window === "undefined") return { user: null, token: null, isAuthenticated: false }
  try {
    const raw = localStorage.getItem(STORAGE_SESSION)
    if (!raw) return { user: null, token: null, isAuthenticated: false }
    const { token } = JSON.parse(raw) as { token: string }
    const payload = parseToken(token)
    if (!payload || payload.exp < Date.now()) {
      localStorage.removeItem(STORAGE_SESSION)
      return { user: null, token: null, isAuthenticated: false }
    }
    const user = getAllUsers().find((u) => u.id === payload.id) || null
    if (!user) {
      localStorage.removeItem(STORAGE_SESSION)
      return { user: null, token: null, isAuthenticated: false }
    }
    return { user, token, isAuthenticated: true }
  } catch {
    return { user: null, token: null, isAuthenticated: false }
  }
}

export const storeSession = (session: { user: User; token: string }) => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_SESSION, JSON.stringify(session))
}

export const clearSession = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_SESSION)
}

// -----------------------------
// Auth Service (mock API)
// -----------------------------
export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    await new Promise((r) => setTimeout(r, 300))
    const user = getAllUsers().find((u) => normEmail(u.email) === normEmail(email))
    if (!user) return null
    if (!verifyPassword(password, user.passwordHash as any)) return null
    const token = createToken(user)
    return { user, token }
  },

  async register(name: string, email: string, password: string, role: User["role"]): Promise<{ user: User; token: string }> {
    await new Promise((r) => setTimeout(r, 500))
    const all = getAllUsers()
    if (all.some((u) => normEmail(u.email) === normEmail(email))) {
      throw new Error("Email already exists")
    }
    const user: User = {
      id: crypto.randomUUID(),
      name: (name || "").trim(),
      email: normEmail(email),
      role,
      passwordHash: mockHash(password),
      createdAt: new Date().toISOString(),
    }
    saveOrReplaceUser(user) // simpan ke localStorage pool
    const token = createToken(user)
    return { user, token }
  },

  getCurrentUser(): User | null {
    const s = getStoredSession()
    return s.isAuthenticated ? (s.user as User) : null
  },

  logout(): void {
    clearSession()
  },
}

// -----------------------------
// Demo credentials (email & password)
// -----------------------------
export const DEMO_CREDENTIALS = [
  { email: "finance", password: "password123", role: "finance" },
  { email: "writer", password: "password123", role: "writer" },
  { email: "user1",  password: "password123", role: "user"   },
] as const
