// /lib/jwt.ts
export type JwtPayload = { exp?: number; [k: string]: any };

export function parseJwt(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const payload = parseJwt(token);
  const rawExp = (payload && typeof payload.exp === 'number') ? payload.exp : undefined;
  if (!rawExp) return false; // opaque token dianggap valid
  const expSec = rawExp > 1e12 ? Math.floor(rawExp / 1000) : rawExp; // ms→s kalau perlu
  const now = Math.floor(Date.now() / 1000);
  return now >= (expSec - skewSeconds);
}

