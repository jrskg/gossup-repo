import {sendNotification} from "./firebase.js";
import {kafkaClient} from "./kafka.js";
import {
  KAFKA_NOTIFICATION_GROUP_ID,
  KAFKA_NOTIFICATION_TOPIC,
} from "@gossup/shared-constants";

export const startNotificationConsumer = async () => {
  const consumer = kafkaClient.consumer({ groupId: KAFKA_NOTIFICATION_GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({
    topic: KAFKA_NOTIFICATION_TOPIC,
    fromBeginning: true,
  });
  await consumer.run({
    eachMessage: async ({ message, heartbeat }) => {
      const { tokens, options, data } = JSON.parse(message.value.toString());
      console.log({
        tokens,
        options,
        data
      })
      tokens.forEach(
        async (token) => await sendNotification(token.token, options, data)
      );
      await heartbeat();
    },
  });
};
