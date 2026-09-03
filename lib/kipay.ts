import crypto from "node:crypto";

const BASE_URL = process.env.KIPAY_BASE_URL;
const API_KEY = process.env.KIPAY_API_KEY;

export type KipayTransactionStatus = "pending" | "paid" | "expired" | "failed";

export type KipayTransaction = {
  id: number;
  trx_id: string;
  project_id: number;
  mode: string;
  requested_amount: number;
  unique_code: number;
  amount: number;
  fee_amount: number;
  net_amount: number;
  fee_bearer: string;
  status: KipayTransactionStatus;
  provider: string | null;
  note: string | null;
  qr_payload: string | null;
  created_at: string;
  expires_at: string;
  matched_at: string | null;
};

async function kipayFetch(path: string, init?: RequestInit): Promise<KipayTransaction> {
  if (!BASE_URL || !API_KEY) {
    throw new Error("KIPAY_BASE_URL atau KIPAY_API_KEY belum diset");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body && typeof body === "object" && "error" in body ? String(body.error) : null;
    throw new Error(message ?? `KiPay error ${res.status}`);
  }

  return res.json();
}

export function createKipayTransaction(amount: number, note?: string): Promise<KipayTransaction> {
  return kipayFetch(`/pay/${API_KEY}/transactions`, {
    method: "POST",
    body: JSON.stringify({ amount, note }),
  });
}

export function getKipayTransaction(trxId: string): Promise<KipayTransaction> {
  return kipayFetch(`/pay/${API_KEY}/transactions/${trxId}`);
}

export function verifyKipaySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.KIPAY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signatureHeader);

  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}
