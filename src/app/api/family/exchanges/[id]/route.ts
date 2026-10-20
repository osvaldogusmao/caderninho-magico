import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decideSchema, familyIdFrom } from "@/lib/game-family";

// Os pais pagam (os diamantes saem de vez) ou recusam (os diamantes voltam para a criança).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const familyId = familyIdFrom(req);
  if (!familyId) return NextResponse.json({ error: "Digite o PIN dos pais" }, { status: 401 });
  const { id } = await params;
  const parsed = decideSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const ex = await prisma.gameExchange.findUnique({ where: { id }, include: { player: true } });
  if (!ex || ex.player.familyId !== familyId) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  const action = parsed.data.action;
  const done = await prisma.$transaction(async (tx) => {
    const changed = await tx.gameExchange.updateMany({
      where: { id, status: "pending" },
      data: { status: action, decidedAt: new Date() },
    });
    if (!changed.count) return false;
    if (action === "rejected") await tx.gamePlayer.update({ where: { id: ex.playerId }, data: { gems: { increment: ex.gems } } });
    return true;
  });
  if (!done) return NextResponse.json({ error: "Esse pedido já foi decidido" }, { status: 409 });
  return NextResponse.json({ ok: true });
}
