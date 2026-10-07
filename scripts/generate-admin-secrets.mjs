import { pbkdf2Sync, randomBytes } from "node:crypto";

const password = process.argv[2];

if (!password || password.length < 12) {
  console.error('Usage: node scripts/generate-admin-secrets.mjs "a-password-with-at-least-12-characters"');
  process.exit(1);
}

const iterations = 310_000;
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const base64url = (value) => value.toString("base64url");

console.log(`ADMIN_PASSWORD_HASH="pbkdf2:${iterations}:${base64url(salt)}:${base64url(hash)}"`);
console.log(`AUTH_SECRET="${base64url(randomBytes(48))}"`);
console.log("\nStore these only in .env.local and your hosting provider's secret manager.");
