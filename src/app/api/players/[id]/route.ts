import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { countStars, normalizeCode, ownPlayer, updatePlayerSchema } from "@/lib/game";

// Salva perfil e progresso. O código do jogador funciona como senha simples.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = updatePlayerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }
  const { code, progress, ...fields } = parsed.data;

  const player = await prisma.gamePlayer.findUnique({ where: { id } });
  if (!player || player.code !== normalizeCode(code)) {
    return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  }

  const updated = await prisma.gamePlayer.update({
    where: { id },
    data: { ...fields, progress, stars: countStars(progress) },
  });
  return NextResponse.json(ownPlayer(updated));
}
