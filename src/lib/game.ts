import { randomInt } from "node:crypto";
import { z } from "zod";
import type { GamePlayer } from "@prisma/client";

// Regras do jogo Caderninho Mágico (public/index.html): jogadores sem conta,
// identificados pelo id + código que o aparelho guarda.

export const GRADES = ["p", "1", "2", "3", "4", "5", "6"] as const;

const name = z
  .string()
  .trim()
  .min(1, "Digite um nome")
  .max(20, "Use até 20 letras")
  .regex(/^[\p{L}\p{M} '-]+$/u, "Use só letras");

export const playerName = name;

const profileFields = {
  name,
  gender: z.enum(["f", "m"]),
  mate: z.string().regex(/^[a-z]{2,20}$/),
  grade: z.enum(GRADES),
};

// { "1:contar": [3, 2, 0], ... } — chaves "ano:mundo", até 3 níveis de 0 a 3 estrelas
const progress = z
  .record(
    z.string().regex(/^[p1-6]:[a-z0-9]{1,24}$/),
    z.array(z.number().int().min(0).max(3)).max(3)
  )
  .refine((p) => Object.keys(p).length <= 200, "Progresso grande demais");

// "2019-05-14": a criança entra com o nome e a data de nascimento
export const birthDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha a data de nascimento")
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    const year = Number(s.slice(0, 4));
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s && year >= 1990 && d <= new Date();
  }, "Data de nascimento inválida");

export const createPlayerSchema = z.object({ ...profileFields, birthDate });

// Entrar: tocando no nome da lista (id) ou digitando o nome, sempre com a data de nascimento
export const loginSchema = z.union([
  z.object({ id: z.string().min(1).max(40), birthDate }),
  z.object({ name, birthDate }),
]);

export const lessonSchema = z.object({
  code: z.string(),
  key: z.string().regex(/^[p1-6]:[a-z0-9]{1,24}$/),
  level: z.number().int().min(0).max(5),
  stars: z.number().int().min(0).max(3),
  score: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(100),
  reviews: z.number().int().min(0).max(100).default(0),
  seconds: z.number().int().min(0).max(24 * 3600).default(0),
});

export const exchangeSchema = z.object({ code: z.string(), coins: z.number().int().min(1).max(1000) });

export const toBirthDate = (s: string) => new Date(`${s}T00:00:00Z`);
export const fromBirthDate = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

/** Dia de hoje em São Paulo, "2026-10-20": o limite diário de diamantes vira à meia-noite daqui. */
export function today(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}

/** Diamantes que uma lição dá: uma por estrela, até o que ainda cabe no limite do dia. */
export function lessonGems(stars: number, earnedToday: number, dailyLimit: number): number {
  return Math.max(0, Math.min(stars, dailyLimit - earnedToday));
}

/** Limite diário de diamantes de um jogador: o dele, senão o da família, senão o padrão. */
export const dailyLimit = (p: { gemLimit: number | null; family: { dailyGemLimit: number } | null }) =>
  p.gemLimit ?? p.family?.dailyGemLimit ?? DEFAULT_RULES.dailyGemLimit;

export const DEFAULT_RULES = { gemsPerCoin: 100, coinCents: 5000, dailyGemLimit: 30 };

export const updatePlayerSchema = z.object({
  code: z.string(),
  ...profileFields,
  // sem "gems": os diamantes são só do servidor, e o zod descarta o que o aparelho mandar
  progress,
});

export const recoverPlayerSchema = z.object({ name, code: z.string() });

export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^([A-Z]{3})(\d{3})$/, "$1-$2");
}

// Três letras fáceis de ler (sem I, O, Q) e três números: "GAT-427"
export function generatePlayerCode(): string {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 3; i++) out += letters[randomInt(letters.length)];
  return `${out}-${String(randomInt(1000)).padStart(3, "0")}`;
}

export function countStars(p: Record<string, number[]>, grade?: string): number {
  let total = 0;
  for (const [key, levels] of Object.entries(p)) {
    if (grade && !key.startsWith(`${grade}:`)) continue;
    for (const s of levels) total += s;
  }
  return total;
}

export const sameName = (a: string, b: string) =>
  a.localeCompare(b, "pt-BR", { sensitivity: "base" }) === 0;

/** O que o próprio jogador recebe de volta (inclui o código). */
export function ownPlayer(p: GamePlayer) {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    birthDate: fromBirthDate(p.birthDate),
    familyId: p.familyId,
    gender: p.gender,
    mate: p.mate,
    grade: p.grade,
    stars: p.stars,
    gems: p.gems,
    progress: p.progress,
    items: p.items,
    wear: p.wear,
  };
}
