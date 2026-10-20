import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeSchema, normalizeCode } from "@/lib/game";

// A criança pede para trocar diamantes por Family Coins: os diamantes ficam reservados até os pais decidirem.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = exchangeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const player = await prisma.gamePlayer.findUnique({ where: { id }, include: { family: true } });
  if (!player || player.code !== normalizeCode(parsed.data.code)) {
    return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  }
  const f = player.family;
  if (!f) return NextResponse.json({ error: "Peça para seus pais criarem a Área dos pais." }, { status: 409 });

  const { coins } = parsed.data;
  const gems = coins * f.gemsPerCoin;
  const done = await prisma.$transaction(async (tx) => {
    // só desconta se ainda houver saldo (protege contra dois pedidos ao mesmo tempo)
    const took = await tx.gamePlayer.updateMany({ where: { id, gems: { gte: gems } }, data: { gems: { decrement: gems } } });
    if (!took.count) return null;
    return tx.gameExchange.create({ data: { playerId: id, gems, coins, cents: coins * f.coinCents } });
  });
  if (!done) return NextResponse.json({ error: "Diamantes insuficientes" }, { status: 409 });
  return NextResponse.json({ id: done.id, gems: player.gems - gems }, { status: 201 });
}
