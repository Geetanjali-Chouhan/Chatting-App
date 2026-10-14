import mongoose from "mongoose";
import dns from "dns";

// Use Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async () => {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    const instance = await mongoose.connect(MONGODB_URL);
    console.log(`MongoDB Connected: ${instance.connection.host}`);
  } catch (error) {
    console.log(error);
  } 
};