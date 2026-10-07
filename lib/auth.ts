const encoder = new TextEncoder();
export const ADMIN_SESSION_COOKIE = "pogdog_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function importHmacKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters");
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function signPayload(payload: string) {
  const key = await importHmacKey();
  return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload))));
}

export async function verifyPassword(password: string, storedHash: string) {
  const separator = storedHash.includes(":") ? ":" : "$";
  const [algorithm, iterationText, saltText, hashText] = storedHash.split(separator);
  if (algorithm !== "pbkdf2" || !iterationText || !saltText || !hashText) return false;
  const iterations = Number(iterationText);
  if (!Number.isInteger(iterations) || iterations < 100_000) return false;
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: fromBase64Url(saltText), iterations, hash: "SHA-256" }, keyMaterial, 256));
  const expected = fromBase64Url(hashText);
  if (derived.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < derived.length; index += 1) difference |= derived[index] ^ expected[index];
  return difference === 0;
}

export async function createSessionToken() {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${expiresAt}.${crypto.randomUUID()}`;
  return `${toBase64Url(encoder.encode(payload))}.${await signPayload(payload)}`;
}

export async function verifySessionToken(token?: string) {
  if (!token) return false;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;
  try {
    const payload = new TextDecoder().decode(fromBase64Url(encodedPayload));
    const [expiresAtText] = payload.split(".");
    if (!expiresAtText || Number(expiresAtText) < Date.now()) return false;
    const key = await importHmacKey();
    return crypto.subtle.verify("HMAC", key, fromBase64Url(signature), encoder.encode(payload));
  } catch {
    return false;
  }
}

export { SESSION_MAX_AGE };
