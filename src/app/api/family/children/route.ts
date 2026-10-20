import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generatePlayerCode, toBirthDate } from "@/lib/game";
import { addChildSchema, familyIdFrom } from "@/lib/game-family";

// Coloca mais um filho na família: liga quem já joga (nome + data de nascimento)
// ou, com ano, menina/menino e personagem, cria o perfil dele.
export async function POST(req: Request) {
  const familyId = familyIdFrom(req);
  if (!familyId) return NextResponse.json({ error: "Digite o PIN dos pais" }, { status: 401 });
  const parsed = addChildSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Digite o nome e a data de nascimento" }, { status: 400 });
  }
  const { name, birthDate, profile } = parsed.data;
  const born = toBirthDate(birthDate);

  const kid = await prisma.gamePlayer.findFirst({ where: { name: { equals: name, mode: "insensitive" }, birthDate: born } });
  if (kid) {
    if (kid.familyId && kid.familyId !== familyId) {
      return NextResponse.json({ error: "Esse jogador já está em outra família." }, { status: 409 });
    }
    await prisma.gamePlayer.update({ where: { id: kid.id }, data: { familyId } });
    return NextResponse.json({ id: kid.id, created: false });
  }
  if (!profile) {
    return NextResponse.json({ error: "Não achamos esse nome com essa data. Para criar o perfil, escolha o ano e o personagem." }, { status: 404 });
  }

  // O código é único; numa colisão (rara) tenta outro.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const created = await prisma.gamePlayer.create({
        data: { name, birthDate: born, ...profile, familyId, code: generatePlayerCode() },
      });
      return NextResponse.json({ id: created.id, created: true }, { status: 201 });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
  }
  return NextResponse.json({ error: "Tente de novo" }, { status: 503 });
}
