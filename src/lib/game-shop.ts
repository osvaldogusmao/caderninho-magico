import { z } from "zod";

// Loja do Caderninho Mágico: skins e acessórios comprados com diamantes (de 1 a 20).
// O desenho de cada item fica no jogo (jogo/src/6e-shop.js); aqui só preço e lugar.
export const SLOTS = ["head", "face", "extra", "skin"] as const;
export type Slot = (typeof SLOTS)[number];

export const SHOP: Record<string, { price: number; slot: Slot }> = {
  lacinho: { price: 1, slot: "head" },
  flor: { price: 2, slot: "head" },
  oculos: { price: 3, slot: "face" },
  estrela: { price: 4, slot: "head" },
  bone: { price: 5, slot: "head" },
  escuros: { price: 6, slot: "face" },
  coracao: { price: 7, slot: "extra" },
  fones: { price: 8, slot: "head" },
  balao: { price: 9, slot: "extra" },
  neon: { price: 10, slot: "skin" },
  coroa: { price: 11, slot: "head" },
  cartola: { price: 12, slot: "head" },
  dourada: { price: 13, slot: "skin" },
  borboleta: { price: 14, slot: "extra" },
  gelo: { price: 15, slot: "skin" },
  brilho: { price: 16, slot: "extra" },
  fantasma: { price: 17, slot: "skin" },
  arcoiris: { price: 18, slot: "extra" },
  magico: { price: 19, slot: "skin" },
  galaxia: { price: 20, slot: "skin" },
};

const itemId = z.string().refine((s) => s in SHOP, "Item não existe");

export const buySchema = z.object({ code: z.string(), item: itemId });

export const wearSchema = z.object({
  code: z.string(),
  wear: z.object(Object.fromEntries(SLOTS.map((s) => [s, itemId.optional()])) as Record<Slot, z.ZodOptional<typeof itemId>>),
});

/** Itens em uso válidos: cada um comprado e no lugar certo. */
export function validWear(wear: Partial<Record<Slot, string>>, items: string[]): boolean {
  return SLOTS.every((s) => {
    const it = wear[s];
    return !it || (items.includes(it) && SHOP[it].slot === s);
  });
}

export const asItems = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
