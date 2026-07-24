import { Hono } from 'hono';
// Change this:
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});
import { CartItemsType } from '@repo/types';
import { getStripeProductPrice } from '../utils/stripeProduct';

const sessions = new Hono();

sessions.post('/create-checkout-session', async (c) => {
  const { cart }: { cart: CartItemsType } = await c.req.json();
  const userId = c.get("userId" as any);
  const lineItems = await Promise.all(
    cart.map(async (item) => {
      const unitAmount = await getStripeProductPrice(item.id);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: unitAmount as number,
        },
        quantity: item.quantity,
      };
    })
  );

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      client_reference_id: userId,
      mode: "payment",
      ui_mode: "custom",
      return_url:
        "http://localhost:3000/return?session_id={CHECKOUT_SESSION_ID}",
    });

    return c.json({ checkoutSessionClientSecret: session.client_secret });
  } catch (error) {
    console.log(error);
    return c.json(error);

  }


});

 

sessions.get("/:session_id", async (c) => {
  const { session_id } = c.req.param();
  const session = await stripe.checkout.sessions.retrieve(
    session_id as string,
    {
      expand: ["line_items"],
    }
  );

  // console.log(session);

  return c.json({
    status: session.status,
    paymentStatus: session.payment_status,
  });
});







export default sessions;