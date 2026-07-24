import Fastify from "fastify"
import { clerkPlugin, getAuth } from '@clerk/fastify'
import { shouldBeUser } from "./middleware/authMiddleware.js";
import { connectOrderDB } from "@repo/order-db";
import { orderRoute } from "./routes/order.js";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscription.js";
const  fastify =Fastify();
fastify.register(clerkPlugin)
fastify.register(orderRoute);
fastify.get("/" , (request ,reply )=>{
  return reply.send("order service works properly");
})

fastify.get("/test" ,{preHandler:shouldBeUser}, (request ,reply )=>{
   return reply.code(401).send({error:"order service is authenticated "});
})





const start = async () => {
  try {
     Promise.all([
      await connectOrderDB(),
      await producer.connect(),
      await consumer.connect(),
    ]);
    await runKafkaSubscriptions();
    await fastify.listen({ port: 8001 })
    console.log("order service is running on port 8001")
  } catch (err) {
    
    process.exit(1)
    
  }
}
start()