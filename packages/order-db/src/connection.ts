import mongoose from "mongoose"

let isConnected = false;
export const connectOrderDB = async () => {
    if (isConnected) return;
    if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL is not defined in the env file ");
    }
    try {
        await mongoose.connect(process.env.MONGO_URL)
        isConnected = true;
        console.log("connected to mongo db order");

    } catch (error) {
        console.log(error);
        throw (error);
    }

}