import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { birthDate } from "@/lib/game";

// Área dos pais do Caderninho Mágico: a família entra com um PIN de 4 dígitos.

export const pin = z.string().regex(/^\d{4}$/, "O PIN tem 4 números");

export const childRef = z.object({ name: z.string().trim().min(1).max(20), birthDate });

export const createFamilySchema = z.object({ pin, child: childRef });

// Num aparelho que já conhece a família basta o PIN; num aparelho novo, um filho identifica a família.
export const familyLoginSchema = z.union([
  z.object({ familyId: z.string().min(1).max(40), pin }),
  z.object({ child: childRef, pin }),
]);

export const familySettingsSchema = z.object({
  gemsPerCoin: z.number().int().min(1).max(10_000),
  coinCents: z.number().int().min(1).max(100_000),
  dailyGemLimit: z.number().int().min(0).max(1000),
  newPin: pin.optional(),
});

export const decideSchema = z.object({ action: z.enum(["paid", "rejected"]) });

export const MAX_PIN_TRIES = 5;
export const LOCK_MINUTES = 15;

export function hashPin(value: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(value, salt, 32).toString("hex")}`;
}

export function checkPin(value: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const got = scryptSync(value, salt, 32);
  const want = Buffer.from(hash, "hex");
  return got.length === want.length && timingSafeEqual(got, want);
}

const TOKEN_HOURS = 12;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET não configurado");
  return s;
}

const sign = (data: string) => createHmac("sha256", secret()).update(`caderninho-family:${data}`).digest("base64url");

/** Sessão dos pais: "familyId.expira.assinatura", enviada no cabeçalho x-family-token. */
export function familyToken(familyId: string, now = Date.now()): string {
  const data = `${familyId}.${now + TOKEN_HOURS * 3600_000}`;
  return `${data}.${sign(data)}`;
}

export function familyFromToken(token: string | null, now = Date.now()): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [familyId, exp, mac] = parts;
  const want = sign(`${familyId}.${exp}`);
  if (mac.length !== want.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(want))) return null;
  return Number(exp) > now ? familyId : null;
}

export const familyIdFrom = (req: Request) => familyFromToken(req.headers.get("x-family-token"));
