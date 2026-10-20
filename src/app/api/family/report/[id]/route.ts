import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { today } from "@/lib/game";
import { familyIdFrom } from "@/lib/game-family";

export const dynamic = "force-dynamic";

const DAYS = 30;

// Relatório de um filho: atividade dos últimos 30 dias, acertos, onde tem mais dificuldade e trocas.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const familyId = familyIdFrom(req);
  if (!familyId) return NextResponse.json({ error: "Digite o PIN dos pais" }, { status: 401 });
  const { id } = await params;
  const player = await prisma.gamePlayer.findFirst({ where: { id, familyId } });
  if (!player) return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });

  const now = new Date();
  const dayList = Array.from({ length: DAYS }, (_, i) => today(new Date(now.getTime() - (DAYS - 1 - i) * 86_400_000)));
  const since = new Date(now.getTime() - 2 * DAYS * 86_400_000);
  const [lessons, exchanges, allTime] = await Promise.all([
    prisma.gameLesson.findMany({ where: { playerId: id, createdAt: { gte: since } }, orderBy: { createdAt: "desc" } }),
    prisma.gameExchange.findMany({ where: { playerId: id }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.gameLesson.aggregate({ where: { playerId: id }, _count: true, _sum: { gems: true, seconds: true } }),
  ]);

  const recent = lessons.filter((l) => l.day >= dayList[0]);
  const before = lessons.filter((l) => l.day < dayList[0]);
  // acertos de primeira, só das lições de perguntas (o "Em ordem!" guarda erros no score)
  const rate = (ls: typeof lessons) => {
    const q = ls.filter((l) => !l.key.match(/^1:bn\w+5$/));
    const total = q.reduce((a, l) => a + l.total, 0);
    return total ? Math.round((100 * q.reduce((a, l) => a + l.score, 0)) / total) : null;
  };

  const days = dayList.map((day) => {
    const ls = recent.filter((l) => l.day === day);
    return {
      day,
      lessons: ls.length,
      gems: ls.reduce((a, l) => a + l.gems, 0),
      seconds: ls.reduce((a, l) => a + l.seconds, 0),
    };
  });

  const byKey = new Map<string, { key: string; lessons: number; score: number; total: number; reviews: number }>();
  for (const l of recent) {
    if (l.key.match(/^1:bn\w+5$/)) continue;
    const k = byKey.get(l.key) ?? { key: l.key, lessons: 0, score: 0, total: 0, reviews: 0 };
    k.lessons++;
    k.score += l.score;
    k.total += l.total;
    k.reviews += l.reviews;
    byKey.set(l.key, k);
  }
  const worlds = [...byKey.values()].map((k) => ({ key: k.key, lessons: k.lessons, rate: Math.round((100 * k.score) / k.total), reviews: k.reviews }));

  // pior metade em "precisa de ajuda", melhor metade em "mandando bem": nenhum mundo nas duas listas
  const byRate = [...worlds].sort((a, b) => a.rate - b.rate);

  return NextResponse.json({
    player: { id: player.id, name: player.name, grade: player.grade, stars: player.stars, gems: player.gems, progress: player.progress, items: player.items },
    totals: {
      lessons: allTime._count,
      gems: allTime._sum.gems ?? 0,
      seconds: allTime._sum.seconds ?? 0,
      coinsPaid: exchanges.filter((e) => e.status === "paid").reduce((a, e) => a + e.coins, 0),
      centsPaid: exchanges.filter((e) => e.status === "paid").reduce((a, e) => a + e.cents, 0),
    },
    rate: { now: rate(recent), before: rate(before) },
    days,
    hardest: byRate.slice(0, Math.min(5, Math.ceil(byRate.length / 2))),
    best: byRate.slice(Math.ceil(byRate.length / 2)).reverse().slice(0, 5),
    recent: recent.slice(0, 15).map((l) => ({ key: l.key, level: l.level, stars: l.stars, score: l.score, total: l.total, reviews: l.reviews, gems: l.gems, at: l.createdAt })),
    exchanges: exchanges.map((e) => ({ id: e.id, gems: e.gems, coins: e.coins, cents: e.cents, status: e.status, createdAt: e.createdAt, decidedAt: e.decidedAt })),
  });
}
