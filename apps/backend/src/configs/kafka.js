import { Kafka } from "kafkajs";
import { KAFKA_BROKER } from "./env.index.js";

const kafka = new Kafka({
  clientId: "goss-up",
  brokers: [KAFKA_BROKER],
});

let producer = null;

export const getProducer = async () => {
  if (producer) return producer;
  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
};

export const produceNotification = async (topic, data) => {
  //data : { token, options, data } options: { title, body }
  const producer = await getProducer();
  await producer.send({
    topic,
    messages: [
      {
        value: JSON.stringify(data),
      },
    ],
  });
};

export const produceMessageAndUpdates = async (topic, data) => {
  const producer = await getProducer();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(data) }],
  });
};

export default kafka;
