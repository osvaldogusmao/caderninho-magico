import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dailyLimit, normalizeCode, today } from "@/lib/game";

export const dynamic = "force-dynamic";

// Carteira da criança: diamantes, limite de hoje, regras da troca e pedidos.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const code = new URL(req.url).searchParams.get("code") ?? "";
  const player = await prisma.gamePlayer.findUnique({ where: { id }, include: { family: true } });
  if (!player || player.code !== normalizeCode(code)) {
    return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  }
  const [sum, exchanges] = await Promise.all([
    prisma.gameLesson.aggregate({ where: { playerId: id, day: today() }, _sum: { gems: true } }),
    prisma.gameExchange.findMany({ where: { playerId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const f = player.family;
  return NextResponse.json({
    gems: player.gems,
    today: sum._sum.gems ?? 0,
    limit: dailyLimit(player),
    family: f ? { gemsPerCoin: f.gemsPerCoin, coinCents: f.coinCents } : null,
    coins: exchanges.filter((e) => e.status === "paid").reduce((a, e) => a + e.coins, 0),
    exchanges: exchanges.map((e) => ({ id: e.id, gems: e.gems, coins: e.coins, cents: e.cents, status: e.status, createdAt: e.createdAt })),
  });
}
