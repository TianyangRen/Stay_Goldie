import { z } from "zod";

/** JSON body for POST /api/stripe/checkout (shop cart or booking deposit). */
export const checkoutPostBodySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("shop_order"),
    items: z
      .array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive() }))
      .min(1),
  }),
  z.object({
    type: z.literal("booking_deposit"),
    bookingId: z.string().min(1),
  }),
]);

export type CheckoutPostBody = z.infer<typeof checkoutPostBodySchema>;
