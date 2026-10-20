import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema, ownPlayer, toBirthDate } from "@/lib/game";

const WRONG = "Essa data não confere. Peça ajuda para um adulto.";

// A criança entra com o nome (ou tocando nele na lista) e a data de nascimento.
export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Escolha a data de nascimento" }, { status: 400 });
  }
  const born = toBirthDate(parsed.data.birthDate);

  if ("id" in parsed.data) {
    const player = await prisma.gamePlayer.findUnique({ where: { id: parsed.data.id } });
    if (!player) return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
    if (!player.birthDate) {
      // jogador de antes do login: a primeira data informada passa a ser a dele
      const updated = await prisma.gamePlayer.update({ where: { id: player.id }, data: { birthDate: born } });
      return NextResponse.json(ownPlayer(updated));
    }
    if (player.birthDate.getTime() !== born.getTime()) return NextResponse.json({ error: WRONG }, { status: 401 });
    return NextResponse.json(ownPlayer(player));
  }

  const player = await prisma.gamePlayer.findFirst({
    where: { name: { equals: parsed.data.name, mode: "insensitive" }, birthDate: born },
  });
  if (!player) return NextResponse.json({ error: "Não achamos esse nome com essa data." }, { status: 404 });
  return NextResponse.json(ownPlayer(player));
}
