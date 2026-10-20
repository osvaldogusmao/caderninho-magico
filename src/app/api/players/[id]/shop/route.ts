import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCode } from "@/lib/game";
import { SHOP, asItems, buySchema, validWear, wearSchema } from "@/lib/game-shop";

const notFound = () => NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 });

// Compra um item da loja com diamantes.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = buySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Item inválido" }, { status: 400 });
  const { code, item } = parsed.data;
  const price = SHOP[item].price;

  const result = await prisma.$transaction(async (tx) => {
    const player = await tx.gamePlayer.findUnique({ where: { id } });
    if (!player || player.code !== normalizeCode(code)) return { status: 404 as const };
    const items = asItems(player.items);
    if (items.includes(item)) return { status: 409 as const, error: "Você já tem esse item" };
    // só desconta se ainda houver saldo (protege contra duas compras ao mesmo tempo)
    const took = await tx.gamePlayer.updateMany({
      where: { id, gems: { gte: price } },
      data: { gems: { decrement: price }, items: [...items, item] },
    });
    if (!took.count) return { status: 409 as const, error: "Diamantes insuficientes" };
    return { status: 200 as const, gems: player.gems - price, items: [...items, item] };
  });
  if (result.status === 404) return notFound();
  if (result.status === 409) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ gems: result.gems, items: result.items });
}

// Escolhe o que o personagem está usando (só itens já comprados).
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = wearSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Item inválido" }, { status: 400 });
  const player = await prisma.gamePlayer.findUnique({ where: { id } });
  if (!player || player.code !== normalizeCode(parsed.data.code)) return notFound();
  if (!validWear(parsed.data.wear, asItems(player.items))) {
    return NextResponse.json({ error: "Compre o item antes de usar" }, { status: 409 });
  }
  const updated = await prisma.gamePlayer.update({ where: { id }, data: { wear: parsed.data.wear } });
  return NextResponse.json({ wear: updated.wear });
}
