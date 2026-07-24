import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { clerkMiddleware } from '@hono/clerk-auth'
import sessionRoute from './routes/session.route.js'
import { cors } from 'hono/cors'
import webhookRoute from './routes/webhooks.route.js'
import { consumer, producer } from './utils/kafka.js'
import { runKafkaSubscriptions } from './utils/subscriptions.js'
const app = new Hono()
app.use('*', clerkMiddleware())
app.use('*', cors({ origin: ["http://localhost:3000", "http://localhost:3002"] }))

app.get('/', (c) => {
  return c.text('payment serv ice is also working properly !!');
})

app.route("/sessions", sessionRoute);
app.route("/webhooks",webhookRoute);

const start = async () => {
  try {
    Promise.all([
      await producer.connect(),
      await consumer.connect(),
    ]);
    await runKafkaSubscriptions();
    serve({
      fetch: app.fetch,
      port: 8002
    }, (info) => {
      console.log(`payment service is running on port 8002`)
    })
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

start();