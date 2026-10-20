import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dailyLimit, lessonGems, lessonSchema, normalizeCode, today } from "@/lib/game";

// Registra uma lição terminada e dá os diamantes dela, respeitando o limite diário (do filho ou da família).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = lessonSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const { code, ...lesson } = parsed.data;

  const player = await prisma.gamePlayer.findUnique({ where: { id }, include: { family: true } });
  if (!player || player.code !== normalizeCode(code)) {
    return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  }
  const limit = dailyLimit(player);
  const day = today();

  const result = await prisma.$transaction(async (tx) => {
    const sum = await tx.gameLesson.aggregate({ where: { playerId: id, day }, _sum: { gems: true } });
    const earnedToday = sum._sum.gems ?? 0;
    const gems = lessonGems(lesson.stars, earnedToday, limit);
    await tx.gameLesson.create({ data: { ...lesson, playerId: id, gems, day } });
    const updated = gems
      ? await tx.gamePlayer.update({ where: { id }, data: { gems: { increment: gems } } })
      : player;
    return { earned: gems, gems: updated.gems, today: earnedToday + gems, limit };
  });
  return NextResponse.json(result);
}
