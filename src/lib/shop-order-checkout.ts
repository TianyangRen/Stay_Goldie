import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

/** One line in the cart request payload. */
export type ShopCartLineInput = { productId: string; quantity: number };

type OrderLineDraft = {
  productId: string;
  quantity: number;
  unit: number;
  name: string;
};

/** Domain error: inactive product, missing inventory, or insufficient stock. */
export class ShopOrderCheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopOrderCheckoutError";
  }
}

/**
 * Loads products, enforces stock/active rules, returns subtotal and normalized lines.
 */
async function resolveCartLines(
  tx: Prisma.TransactionClient,
  cartItems: ShopCartLineInput[],
): Promise<{ subtotal: number; lines: OrderLineDraft[] }> {
  let subtotal = 0;
  const lines: OrderLineDraft[] = [];

  for (const line of cartItems) {
    const product = await tx.product.findUnique({
      where: { id: line.productId },
      include: { inventory: true },
    });

    if (!product?.isActive || !product.inventory) {
      throw new ShopOrderCheckoutError("Product unavailable");
    }
    if (product.inventory.stock < line.quantity) {
      throw new ShopOrderCheckoutError("Insufficient stock");
    }

    const unit = Number(product.salePriceCad ?? product.basePriceCad);
    subtotal += unit * line.quantity;
    lines.push({
      productId: product.id,
      quantity: line.quantity,
      unit,
      name: product.name,
    });
  }

  return { subtotal, lines };
}

export type ShopOrderWithItems = Prisma.OrderGetPayload<{
  include: { items: { include: { product: true } } };
}>;

/**
 * Persists a PENDING order and line items (prices frozen at checkout time).
 */
export async function createPendingShopOrder(
  ownerId: string,
  cartItems: ShopCartLineInput[],
): Promise<ShopOrderWithItems> {
  return prisma.$transaction(async (tx) => {
    const { subtotal, lines } = await resolveCartLines(tx, cartItems);

    return tx.order.create({
      data: {
        ownerId,
        status: "PENDING",
        subtotalCad: new Prisma.Decimal(subtotal),
        totalCad: new Prisma.Decimal(subtotal),
        items: {
          create: lines.map((row) => ({
            productId: row.productId,
            quantity: row.quantity,
            unitPriceCad: new Prisma.Decimal(row.unit),
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
  });
}

/**
 * Opens Stripe Checkout for a persisted order and saves stripeSessionId on the row.
 */
export async function createStripeSessionForShopOrder(
  stripe: Stripe,
  order: ShopOrderWithItems,
  baseUrl: string,
): Promise<{ url: string | null }> {
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    currency: "cad",
    line_items: order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "cad",
        unit_amount: Math.round(Number(item.unitPriceCad) * 100),
        product_data: { name: item.product.name },
      },
    })),
    success_url: `${baseUrl}/account/orders?checkout=success`,
    cancel_url: `${baseUrl}/shop`,
    metadata: { orderId: order.id },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: stripeSession.id },
  });

  return { url: stripeSession.url ?? null };
}
