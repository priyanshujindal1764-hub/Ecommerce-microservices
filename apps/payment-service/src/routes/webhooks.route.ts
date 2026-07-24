import { Hono } from "hono"
import Stripe from "stripe";
import stripe from "../utils/stripe";
import { producer } from "../utils/kafka";

const webHookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const webhookRoute = new Hono();

webhookRoute.post("/stripe", async (c) => {
    const body = await c.req.text();
    const sign = c.req.header("stripe-signature");

    let event: Stripe.Event

    try {
        event = Stripe.webhooks.constructEvent(body, sign!, webHookSecret);
    } catch (error) {
        console.log("Webhook verification failed");
        return c.json({ error: "webhook verification failed" }, 400);
    }

    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;
            const lineItems = await stripe.checkout.sessions.listLineItems(
                session.id
            )
            // todo create order 
            producer.send("payment.successful", {
                value: {
                    userId: session.client_reference_id,
                    email: session.customer_details?.email,
                    amount: session.amount_total,
                    status: session.payment_status === "paid" ? "success" : "failed",
                    products: lineItems.data.map((item) => ({
                        name: item.description,
                        quantity: item.quantity,
                        price: item.price?.unit_amount,
                    })),
                },
            });


            break;

        default:
            break;
    }

    return c.json({ recieved: true });

})


export default webhookRoute;
