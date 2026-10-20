import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GRADES, countStars } from "@/lib/game";

export const dynamic = "force-dynamic";

const TOP = 20;

type Row = { id: string; name: string; mate: string; grade: string; stars: number; gems: number };

// Ranking por estrelas, geral (?grade ausente) ou de um ano. ?me=<id> marca o próprio jogador.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const grade = url.searchParams.get("grade");
  const me = url.searchParams.get("me");
  if (grade && !(GRADES as readonly string[]).includes(grade)) {
    return NextResponse.json({ error: "Ano inválido" }, { status: 400 });
  }

  const players = await prisma.gamePlayer.findMany({
    where: { stars: { gt: 0 } },
    orderBy: [{ stars: "desc" }, { gems: "desc" }, { updatedAt: "asc" }],
    take: grade ? 1000 : 500,
    select: { id: true, name: true, mate: true, grade: true, stars: true, gems: true, progress: true },
  });

  let rows: Row[] = players.map(({ progress, ...p }) => ({
    ...p,
    stars: grade ? countStars(progress as Record<string, number[]>, grade) : p.stars,
  }));
  if (grade) rows = rows.filter((r) => r.stars > 0).sort((a, b) => b.stars - a.stars || b.gems - a.gems);

  const view = (r: Row, i: number) => ({
    rank: i + 1,
    name: r.name,
    mate: r.mate,
    grade: r.grade,
    stars: r.stars,
    gems: r.gems,
    isMe: r.id === me,
  });
  const top = rows.slice(0, TOP).map(view);
  const myIndex = me ? rows.findIndex((r) => r.id === me) : -1;
  const mine = myIndex >= TOP ? view(rows[myIndex], myIndex) : null;

  return NextResponse.json({ top, me: mine });
}
