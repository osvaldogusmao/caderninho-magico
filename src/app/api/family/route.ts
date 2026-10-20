import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toBirthDate } from "@/lib/game";
import { createFamilySchema, familyIdFrom, familySettingsSchema, familyToken, hashPin } from "@/lib/game-family";

export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "Digite o PIN dos pais" }, { status: 401 });

// Cria a família com o PIN e o primeiro filho (identificado pelo nome e data de nascimento).
export async function POST(req: Request) {
  const parsed = createFamilySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }
  const { pin, child } = parsed.data;
  const kid = await prisma.gamePlayer.findFirst({
    where: { name: { equals: child.name, mode: "insensitive" }, birthDate: toBirthDate(child.birthDate) },
  });
  if (!kid) return NextResponse.json({ error: "Não achamos esse filho com essa data." }, { status: 404 });
  if (kid.familyId) return NextResponse.json({ error: "Esse filho já está numa família. Entre com o PIN." }, { status: 409 });

  const family = await prisma.gameFamily.create({ data: { pinHash: hashPin(pin), players: { connect: { id: kid.id } } } });
  return NextResponse.json({ familyId: family.id, token: familyToken(family.id) }, { status: 201 });
}

// Painel: regras da família e um resumo de cada filho.
export async function GET(req: Request) {
  const familyId = familyIdFrom(req);
  if (!familyId) return unauthorized();
  const family = await prisma.gameFamily.findUnique({
    where: { id: familyId },
    include: {
      players: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, mate: true, grade: true, stars: true, gems: true, birthDate: true },
      },
    },
  });
  if (!family) return unauthorized();
  const ids = family.players.map((p) => p.id);
  const pending = await prisma.gameExchange.findMany({
    where: { playerId: { in: ids }, status: "pending" },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    familyId: family.id,
    rules: { gemsPerCoin: family.gemsPerCoin, coinCents: family.coinCents, dailyGemLimit: family.dailyGemLimit },
    children: family.players.map(({ birthDate, ...p }) => ({ ...p, birthDate: birthDate?.toISOString().slice(0, 10) ?? null })),
    pending: pending.map((e) => ({ id: e.id, playerId: e.playerId, gems: e.gems, coins: e.coins, cents: e.cents, createdAt: e.createdAt })),
  });
}

// Regras da recompensa e troca de PIN.
export async function PUT(req: Request) {
  const familyId = familyIdFrom(req);
  if (!familyId) return unauthorized();
  const parsed = familySettingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }
  const { newPin, ...rules } = parsed.data;
  await prisma.gameFamily.update({
    where: { id: familyId },
    data: { ...rules, ...(newPin ? { pinHash: hashPin(newPin) } : {}) },
  });
  return NextResponse.json({ ok: true });
}
