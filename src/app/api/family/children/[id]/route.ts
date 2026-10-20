import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { childSettingsSchema, familyIdFrom } from "@/lib/game-family";

const unauthorized = () => NextResponse.json({ error: "Digite o PIN dos pais" }, { status: 401 });

// Ajustes de um filho: limite diário de diamantes só dele (null volta para o da família).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const familyId = familyIdFrom(req);
  if (!familyId) return unauthorized();
  const { id } = await params;
  const parsed = childSettingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Limite inválido" }, { status: 400 });
  const out = await prisma.gamePlayer.updateMany({ where: { id, familyId }, data: { gemLimit: parsed.data.gemLimit } });
  if (!out.count) return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// Tira um filho da família (o progresso dele continua salvo). O limite próprio volta ao padrão.
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const familyId = familyIdFrom(req);
  if (!familyId) return unauthorized();
  const { id } = await params;
  const out = await prisma.gamePlayer.updateMany({ where: { id, familyId }, data: { familyId: null, gemLimit: null } });
  if (!out.count) return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
