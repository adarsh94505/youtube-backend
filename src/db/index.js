import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstandce = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB Host: ${connectionInstandce.connection.host}`);
        console.log(connectionInstandce)
    } catch (error) {
        console.error("Error connecting to the MongDB database", error);
        process.exit(1);
    }
}

export default connectDB;