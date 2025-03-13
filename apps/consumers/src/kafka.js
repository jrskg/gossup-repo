import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config({
  path:"./.env"
});

console.log(process.env.KAFKA_BROKER);
export const kafkaClient = new Kafka({
  clientId: "goss-up",
  brokers: [process.env.KAFKA_BROKER],
});