import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCode, ownPlayer, recoverPlayerSchema, sameName } from "@/lib/game";

// Continua um jogador em outro aparelho: nome + código.
export async function POST(req: Request) {
  const parsed = recoverPlayerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Digite o nome e o código" }, { status: 400 });
  }

  const player = await prisma.gamePlayer.findUnique({ where: { code: normalizeCode(parsed.data.code) } });
  if (!player || !sameName(player.name, parsed.data.name)) {
    return NextResponse.json({ error: "Não achamos esse nome com esse código" }, { status: 404 });
  }
  return NextResponse.json(ownPlayer(player));
}
