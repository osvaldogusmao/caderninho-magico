import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { familyIdFrom } from "@/lib/game-family";

// Tira um filho da família (o progresso dele continua salvo).
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const familyId = familyIdFrom(req);
  if (!familyId) return NextResponse.json({ error: "Digite o PIN dos pais" }, { status: 401 });
  const { id } = await params;
  const out = await prisma.gamePlayer.updateMany({ where: { id, familyId }, data: { familyId: null } });
  if (!out.count) return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
