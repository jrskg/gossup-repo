import {
  KAFKA_MESSAGE_GROUP_ID,
  KAFKA_MESSAGE_TOPIC,
  KAFKA_INSERT_EVENT,
  KAFKA_UPDATE_EVENT,
} from "@gossup/shared-constants";
import { kafkaClient } from "./kafka.js";
import { Chat, Message } from "@gossup/db-models";

export const startMessageConsumer = async () => {
  const consumer = kafkaClient.consumer({ groupId: KAFKA_MESSAGE_GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({
    topic: KAFKA_MESSAGE_TOPIC,
    fromBeginning: true,
  });

  let messages = [];
  let timeoutHandle = null;
  const MESSAGE_LIMIT = 100;
  const DELAY_IN_MS = 5000;

  const processBatch = async () => {
    if (messages.length === 0) return;
    const batch = [...messages];
    messages = [];
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
    await dbOperations(batch);
  };

  await consumer.run({
    eachMessage: async ({ message, heartbeat }) => {
      const data = JSON.parse(message.value.toString());
      messages.push(data);
      if (messages.length >= MESSAGE_LIMIT) {
        await processBatch();
      } else if (messages.length === 1) {
        timeoutHandle = setTimeout(processBatch, DELAY_IN_MS);
      }
      await heartbeat();
    },
  });
};

const dbOperations = async (messages) => {
  //messages is an array of objects either conatining insert_message or update_status
  //{event:"insert_message | update_status", data:{}}
  log(messages, "messages to be processed");
  const insertBatch = {};
  const updateBatch = {};
  messages.forEach((m) => {
    if (m.event === KAFKA_INSERT_EVENT) {
      insertBatch[m.data._id] = m.data;
    }
    if (m.event === KAFKA_UPDATE_EVENT) {
      const ifThere = updateBatch[m.data._id];
      if (ifThere) {
        updateBatch[m.data._id] =
          m.data.deliveryStatus === "seen" ? m.data : ifThere;
      } else {
        updateBatch[m.data._id] = m.data;
      }
    }
  });

  Object.keys(insertBatch).forEach((key) => {
    if (updateBatch[key]) {
      insertBatch[key].deliveryStatus = updateBatch[key].deliveryStatus;
      delete updateBatch[key];
    }
  });

  const insertBatchArray = Object.values(insertBatch);
  const bulkMessageUpdate = Object.values(updateBatch).map((data) => ({
    updateOne: {
      filter: { _id: data._id },
      update: {
        $set: {
          deliveryStatus: data.deliveryStatus,
        },
      },
    },
  }));

  try {
    if (insertBatchArray.length > 0) {
      const bulkInsertResponse = await Message.insertMany(insertBatchArray);
      log(bulkInsertResponse, "bulk message insert");
      const chatIdsObj = {};
      bulkInsertResponse.forEach((message) => {
        if (!chatIdsObj[message.chatId]) {
          chatIdsObj[message.chatId] = {
            _id: message._id,
            createdAt: message.createdAt,
          };
        } else {
          if (
            new Date(message.createdAt) >
            new Date(chatIdsObj[message.chatId].createdAt)
          ) {
            chatIdsObj[message.chatId] = {
              _id: message._id,
              createdAt: message.createdAt,
            };
          }
        }
      });
      const bulkLastMessageIdUpdate = Object.keys(chatIdsObj).map((chatId) => ({
        updateOne: {
          filter: { _id: chatId },
          update: {
            $set: {
              lastMessageId: chatIdsObj[chatId]._id,
            },
          },
        },
      }));
      const lastMessageIdUpdateResponse = await Chat.bulkWrite(
        bulkLastMessageIdUpdate
      );
      log(lastMessageIdUpdateResponse, "bulk last message id update");
    }

    if (bulkMessageUpdate.length > 0) {
      const messageStatusUpdateResponse =
        await Message.bulkWrite(bulkMessageUpdate);
      log(messageStatusUpdateResponse, "bulk message status update");
    }
  } catch (error) {
    console.error("ERROR WHILE PROCESSING MESSAGES", error);
  }
};

const log = (data, key) => {
  console.log(
    `******************** ${key.toUpperCase()} STARTS *******************`
  );
  console.log(data);
  console.log(
    `******************** ${key.toUpperCase()} ENDS *********************`
  );
};
