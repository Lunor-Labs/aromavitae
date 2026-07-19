export const ADMIN_COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days — matches backend token expiry

export function setAdminToken(token: string) {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${ADMIN_COOKIE_NAME}=${token}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax${secure}`;
}

export function clearAdminToken() {
  document.cookie = `${ADMIN_COOKIE_NAME}=; path=/; max-age=0`;
}

export function getAdminToken(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${ADMIN_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Reads the email out of the token's payload for display — not a verification step. */
export function decodeAdminEmail(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.email === "string" ? json.email : null;
  } catch {
    return null;
  }
}
