import {startMessageConsumer} from "./messageProcessor.js";
import {startNotificationConsumer} from "./notificationProcessor.js";
import mongoose from "mongoose";
import { DB_NAME } from "@gossup/shared-constants";

const connectDB = async() => {
  try {
    console.log("Connecting to database...");
    const instance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}?retryWrites=true&w=majority`);
    console.log(`DATABASE CONNECTED HOST ${instance.connection.host}`);
  } catch (error) {
    console.log("DATABASE CONNECTION ERROR", error);
    process.exit(1);
  }
}

export default connectDB;

const runner = async() => {
  await connectDB();
  await startMessageConsumer();
  await startNotificationConsumer();
}

runner()
  .then(() => {
    console.log("MESSAGE CONSUMER STARTED...");
    console.log("NOTIFICATION CONSUMER STARTED...");
  }) 
  .catch((e) => {
    console.log("Error while runnig consumers : ", e.message);
  })