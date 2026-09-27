import crypto from "node:crypto";

const BASE_URL = process.env.KIPAY_CDN_BASE_URL ?? "https://cdn.kipay.id";
const EMAIL = process.env.KIPAY_CDN_EMAIL;
const PASSWORD = process.env.KIPAY_CDN_PASSWORD;
const TOTP_SECRET = process.env.KIPAY_CDN_TOTP_SECRET;

function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.replace(/=+$/, "").toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const char of clean) {
    bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function totp(secret: string, stepSeconds = 30, digits = 6): string {
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / stepSeconds);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buf.writeUInt32BE(counter % 2 ** 32, 4);
  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 10 ** digits).toString().padStart(digits, "0");
}

function decodeJwtExpiry(token: string): number {
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  return typeof payload.exp === "number" ? payload.exp : 0;
}

let cachedToken: string | null = null;
let cachedTokenExpiry = 0;

async function login(): Promise<string> {
  if (!EMAIL || !PASSWORD || !TOTP_SECRET) {
    throw new Error("KIPAY_CDN_EMAIL/KIPAY_CDN_PASSWORD/KIPAY_CDN_TOTP_SECRET belum diset di .env");
  }

  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const loginBody = await loginRes.json();
  if (!loginRes.ok) {
    throw new Error(`Login CDN KiPay gagal: ${loginBody.error ?? loginRes.status}`);
  }

  let token: string = loginBody.token;
  if (loginBody.requires2FA) {
    const verifyRes = await fetch(`${BASE_URL}/api/auth/2fa/login/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginToken: loginBody.loginToken, code: totp(TOTP_SECRET) }),
    });
    const verifyBody = await verifyRes.json();
    if (!verifyRes.ok) {
      throw new Error(`Verifikasi 2FA CDN KiPay gagal: ${verifyBody.error ?? verifyRes.status}`);
    }
    token = verifyBody.token;
  }

  cachedToken = token;
  cachedTokenExpiry = decodeJwtExpiry(token);
  return token;
}

async function getToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedTokenExpiry - 60 > now) return cachedToken;
  return login();
}

async function authorizedFetch(path: string, init: RequestInit, retry = true): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401 && retry) {
    cachedToken = null;
    return authorizedFetch(path, init, false);
  }
  return res;
}

export async function uploadProductImage(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);

  const uploadRes = await authorizedFetch("/api/files", { method: "POST", body: form });
  const uploadBody = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(`Upload ke CDN KiPay gagal: ${uploadBody.error ?? uploadRes.status}`);
  }

  const fileId = uploadBody.file.id;
  const visRes = await authorizedFetch(`/api/files/${fileId}/visibility`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isPublic: true }),
  });
  const visBody = await visRes.json();
  if (!visRes.ok) {
    throw new Error(`Gagal set publik di CDN KiPay: ${visBody.error ?? visRes.status}`);
  }

  return `${BASE_URL}/cdn/${visBody.file.public_token}`;
}
