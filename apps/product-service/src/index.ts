import express,{NextFunction, Request,Response} from "express";
import cors from 'cors';
import { clerkMiddleware, getAuth } from '@clerk/express'
import { shouldBeUser } from "./middleware/authMiddleware.js";
import productRouter from "./routes/product.route.js"
import categoryRouter from "./routes/category.route.js"
import { consumer, producer } from "./utils/kafka.js";


const app= express()
app.use(
    cors({
        origin: ["https://localhost:3000" , "https://localhost:3001"],
        credentials:true,

    })
);
app.use(express.json());
app.use(clerkMiddleware());   
app.get("/",(req:Request,res:Response)=>{
    res.json("product service is working properly ");
    

})

app.get("/test",shouldBeUser ,(req:Request,res:Response)=>{
    res.json({message:"authentication is successfull " , userId :req.userId});
    

})

app.use("/products" ,productRouter);
app.use("/categories",categoryRouter);

// errorr handlerr
app.use((err:any , req:Request ,res:Response , next:NextFunction)=>{
    console.log(err);
    return res.status(err.status || 500).json({message:err.message || "internal server error "});

})

const start = async () => {
  try {
    Promise.all([await producer.connect(), await consumer.connect()]);
    app.listen(8000, () => {
      console.log("Product service is running on 8000");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start()

