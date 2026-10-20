import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toBirthDate } from "@/lib/game";
import { LOCK_MINUTES, MAX_PIN_TRIES, checkPin, familyLoginSchema, familyToken } from "@/lib/game-family";

// Entrada dos pais: PIN (com a família lembrada no aparelho, ou um filho para achá-la).
export async function POST(req: Request) {
  const parsed = familyLoginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Digite o PIN de 4 números" }, { status: 400 });

  let familyId: string | null = null;
  if ("familyId" in parsed.data) familyId = parsed.data.familyId;
  else {
    const kid = await prisma.gamePlayer.findFirst({
      where: {
        name: { equals: parsed.data.child.name, mode: "insensitive" },
        birthDate: toBirthDate(parsed.data.child.birthDate),
      },
    });
    familyId = kid?.familyId ?? null;
  }
  const family = familyId ? await prisma.gameFamily.findUnique({ where: { id: familyId } }) : null;
  if (!family) return NextResponse.json({ error: "Família não encontrada" }, { status: 404 });

  if (family.lockedUntil && family.lockedUntil > new Date()) {
    return NextResponse.json({ error: `Muitas tentativas. Tente de novo em ${LOCK_MINUTES} minutos.` }, { status: 429 });
  }
  if (!checkPin(parsed.data.pin, family.pinHash)) {
    const tries = family.failedPins + 1;
    await prisma.gameFamily.update({
      where: { id: family.id },
      data: tries >= MAX_PIN_TRIES
        ? { failedPins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) }
        : { failedPins: tries },
    });
    return NextResponse.json({ error: "PIN errado" }, { status: 401 });
  }
  if (family.failedPins) await prisma.gameFamily.update({ where: { id: family.id }, data: { failedPins: 0 } });
  return NextResponse.json({ familyId: family.id, token: familyToken(family.id) });
}
