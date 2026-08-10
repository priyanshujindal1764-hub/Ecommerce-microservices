import express,{NextFunction, Request,Response} from "express";
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express'
import { shouldBeAdmin } from "./middleware/authMiddleware.js";
import userRouter from "./routes/user.route.js"
import { consumer, producer } from "./utils/kafka.js";



const app= express()
app.use(
    cors({
        origin: [ "https://localhost:3001"],
        credentials:true,

    })
);
app.use(express.json());
app.use(clerkMiddleware());   
app.get("/",(req:Request,res:Response)=>{
    res.json("product service is working properly ");
    

})

app.use("/users",shouldBeAdmin,userRouter);


// errorr handlerr
app.use((err:any , req:Request ,res:Response , next:NextFunction)=>{
    console.log(err);
    return res.status(err.status || 500).json({message:err.message || "internal server error "});

})

const start = async () => {
  try {
     Promise.all([await producer.connect(), await consumer.connect()]);
    app.listen(8003, () => {
      console.log("auth service is running on 8003");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start()

