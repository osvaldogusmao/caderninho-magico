import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toBirthDate } from "@/lib/game";
import { childRef, familyIdFrom } from "@/lib/game-family";

// Coloca mais um filho na família (nome + data de nascimento dele).
export async function POST(req: Request) {
  const familyId = familyIdFrom(req);
  if (!familyId) return NextResponse.json({ error: "Digite o PIN dos pais" }, { status: 401 });
  const parsed = childRef.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Digite o nome e a data de nascimento" }, { status: 400 });

  const kid = await prisma.gamePlayer.findFirst({
    where: { name: { equals: parsed.data.name, mode: "insensitive" }, birthDate: toBirthDate(parsed.data.birthDate) },
  });
  if (!kid) return NextResponse.json({ error: "Não achamos esse jogador com essa data." }, { status: 404 });
  if (kid.familyId && kid.familyId !== familyId) {
    return NextResponse.json({ error: "Esse jogador já está em outra família." }, { status: 409 });
  }
  await prisma.gamePlayer.update({ where: { id: kid.id }, data: { familyId } });
  return NextResponse.json({ ok: true });
}
