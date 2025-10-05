// /lib/api/auth.ts
import { User } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://haniffaiq.com:8080';
const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

type LoginResponse = {
  token: string;
  user?: User & { id?: string };
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: User['role']; // pastikan enum/union-nya match BE kamu
};

// ====== tiny fetch wrapper dengan timeout & error detail ======
async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  timeoutMs = 10_000
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
    }

    if (res.status === 204) return undefined as unknown as T;

    return (await res.json()) as T;
  } catch (e: any) {
    const details =
      e?.name === 'AbortError'
        ? 'Request timeout/aborted'
        : e?.message ?? String(e);
    console.error('[authAPI] fetch failed:', {
      url: `${BASE_URL}${path}`,
      details,
      hint: 'Cek CORS / BASE_URL / HTTPS vs HTTP / API up?',
    });
    throw e;
  } finally {
    clearTimeout(id);
  }
}

// ====== token & user cache helpers ======
function saveToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}
function saveUser(user: User | null) {
  if (typeof window !== 'undefined') {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }
}
function getCachedUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

// ====== PUBLIC API ======
export const authAPI = {
  /**
   * Login -> POST /v1/auth/login
   * Body: { email, password }
   * Expect: { token, user? }
   */
  async login(email: string, password: string): Promise<{ user: User | null; token: string }> {
    const resp = await apiRequest<LoginResponse>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!resp?.token) throw new Error('Login gagal: token tidak diterima');

    saveToken(resp.token);

    // Simpan user kalau ada di response
    let user: User | null = resp.user ?? null;
    saveUser(user);

    // OPSIONAL: kalau BE memberikan user.id dan kamu ingin refresh detailnya:
    // if (!user && resp.user?.id) {
    //   user = await apiRequest<User>(`/v1/users/${resp.user.id}`, {
    //     headers: { Authorization: `Bearer ${resp.token}` },
    //   });
    //   saveUser(user);
    // }

    return { user, token: resp.token };
  },

  /**
   * Register -> POST /v1/auth/register
   * Body: { name, email, password, role }
   * Expect: { token, user? } atau { user } saja tergantung BE.
   * Kalau hanya user, kamu bisa auto-login berikutnya (opsional).
   */
  async register(name: string, email: string, password: string, role: User['role']): Promise<{ user: User | null; token: string | null }> {
    const payload: RegisterPayload = { name, email, password, role };
    const resp = await apiRequest<Partial<LoginResponse> & { user?: User }>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Banyak BE mengembalikan { token, user }. Kalau tidak ada token, jangan paksa.
    const token = (resp as LoginResponse)?.token ?? null;
    const user = resp?.user ?? null;

    if (token) saveToken(token);
    saveUser(user);

    return { user, token };
  },

  /**
   * Current user (cache dulu).
   * Nanti ganti ke hit /v1/users/me kalau endpoint tersedia.
   */
  async getCurrentUser(): Promise<User | null> {
    const cached = getCachedUser();
    if (cached) return cached;

    // Jika kamu punya endpoint profil:
    // const token = getToken();
    // if (!token) return null;
    // const me = await apiRequest<User>('/v1/users/me', {
    //   headers: { Authorization: `Bearer ${token}` },
    // });
    // saveUser(me);
    // return me;

    return null;
  },

  logout() {
    clearToken();
    saveUser(null);
    // Kalau kamu ingin invalidasi di server, tambahkan POST /v1/auth/logout di BE.
  },

  // Ekspor token getter untuk klien API lain
  getToken,
};
