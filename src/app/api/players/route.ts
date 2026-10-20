import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createPlayerSchema, generatePlayerCode, ownPlayer, toBirthDate } from "@/lib/game";

export const dynamic = "force-dynamic";

const LIST = 100;

// Jogadores salvos, para a tela inicial mostrar quem já jogou em qualquer aparelho.
export async function GET() {
  const players = await prisma.gamePlayer.findMany({
    orderBy: { updatedAt: "desc" },
    take: LIST,
    select: { id: true, name: true, gender: true, mate: true, grade: true, stars: true },
  });
  return NextResponse.json({ players });
}

// Cria um jogador do Caderninho Mágico. Rota pública: o jogo não tem login.
export async function POST(req: Request) {
  const parsed = createPlayerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }

  const { birthDate, ...fields } = parsed.data;
  // Nome + data de nascimento são o login: não pode haver dois iguais.
  const same = await prisma.gamePlayer.findFirst({
    where: { name: { equals: fields.name, mode: "insensitive" }, birthDate: toBirthDate(birthDate) },
  });
  if (same) {
    return NextResponse.json({ error: "Esse nome já existe com essa data. Toque no seu nome para entrar." }, { status: 409 });
  }

  // O código é único; numa colisão (rara) tenta outro.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const player = await prisma.gamePlayer.create({
        data: { ...fields, birthDate: toBirthDate(birthDate), code: generatePlayerCode() },
      });
      return NextResponse.json(ownPlayer(player), { status: 201 });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
  }
  return NextResponse.json({ error: "Tente de novo" }, { status: 503 });
}
