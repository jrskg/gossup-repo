import { isValidObjectId, Types } from "mongoose";
import { Chat, Message } from "@gossup/db-models";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  BAD_REQUEST,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "@gossup/shared-constants";
import { v2 as cloudinary } from "cloudinary";
import {
  CLN_API_KEY,
  CLN_API_SECRET,
  CLN_CLOUD_NAME,
} from "../configs/env.index.js";

export const getMessagesOfChat = asyncHandler(async (req, res, next) => {
  let { chatId, page } = req.query;
  page = isNaN(page) ? 1 : Number(page);
  if (page < 1) page = 1;
  const limit = 20;

  if (!chatId || !isValidObjectId(chatId)) {
    return next(new ApiError(BAD_REQUEST, "Invalid chat id"));
  }

  const chat = await Chat.findById(chatId, { participants: 1 }).lean();
  if (!chat) {
    return next(new ApiError(NOT_FOUND, "Chat not found"));
  }
  if (
    !chat.participants.some((p) => p.toString() === req.user._id.toString())
  ) {
    return next(
      new ApiError(UNAUTHORIZED, "You are not a participant of this chat")
    );
  }
  const messages = await Message.aggregate([
    { $match: { chatId: Types.ObjectId.createFromHexString(chatId) } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ]);

  const messagesData = messages[0].data;
  const totalMessages = messages[0].total[0] ? messages[0].total[0].count : 0;
  const hasMore = page * limit < totalMessages;

  res.status(OK).json(
    new ApiResponse(OK, "Get all messages of chat success", {
      messages: messagesData,
      totalMessages,
      hasMore,
    })
  );
});

export const getUploadSignature = asyncHandler(async (req, res, next) => {
  const folderName = "gossup_attachments";
  const timestamp = Math.round(new Date().getTime() / 1000) - 50 * 60;
  const paramsToSign = {
    timestamp,
    folder: folderName,
  };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    CLN_API_SECRET
  );
  res.status(OK).json(
    new ApiResponse(OK, "Signature fetched", {
      signature,
      timestamp,
      apiKey: CLN_API_KEY,
      cloudName: CLN_CLOUD_NAME,
      folderName,
    })
  );
});

export const getUploadSignatureWithConfiguration = asyncHandler(
  async (req, res, next) => {
    const { folderName } = req.body;
    if (!folderName || folderName.trim().length === 0) {
      return next(new ApiError(BAD_REQUEST, "Folder name is required"));
    }
    const timestamp = Math.round(new Date().getTime() / 1000) - 50 * 60;
    const paramsToSign = {
      timestamp,
      folder: folderName,
    };
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      CLN_API_SECRET
    );
    res.status(OK).json(
      new ApiResponse(OK, "Signature fetched", {
        signature,
        timestamp,
        apiKey: CLN_API_KEY,
        cloudName: CLN_CLOUD_NAME,
        folderName,
      })
    );
  }
);
