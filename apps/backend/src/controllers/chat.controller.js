import { isValidObjectId, Types } from "mongoose";
// import { Chat } from "../models/chat.model.js";
// import { Friendship } from "../models/friendship.model.js";
// import { User } from "../models/user.model.js";
import { Chat, Friendship, Message, User } from "@gossup/db-models";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import {
  BAD_REQUEST,
  CLN_CHATICON_FOLDER,
  CREATED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "@gossup/shared-constants";
import { sortUserIds } from "../utils/utility.js";

export const createOneToOneChat = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId || !isValidObjectId(userId)) {
    return next(new ApiError(BAD_REQUEST, "Invalid user id"));
  }
  const user = await User.findById(userId);
  if (!user) {
    return next(new ApiError(NOT_FOUND, "User not found"));
  }
  const [smallerId, biggerId] = sortUserIds(req.user._id, user._id);
  const chat = await Chat.aggregate([
    {
      $match: {
        chatType: "one-to-one",
        participants: [
          Types.ObjectId.createFromHexString(smallerId),
          Types.ObjectId.createFromHexString(biggerId),
        ],
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "lastMessageId",
        foreignField: "_id",
        as: "lastMessageId",
        pipeline: [
          {
            $project: {
              messageType: 1,
              content: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true },
    },
  ]);
  const participants = [req.user, user].map(
    ({ _id, name, profilePic, bio }) => ({
      _id,
      name,
      profilePic,
      bio,
    })
  );
  if (chat.length > 0) {
    let chatData = chat[0];
    return res
      .status(OK)
      .json(
        new ApiResponse(OK, "Chat already exists", { chatData, participants })
      );
  }
  // check if both users are friends
  const friendship = await Friendship.findOne({
    userOneId: smallerId,
    userTwoId: biggerId,
    status: "accepted",
  });
  if (!friendship) {
    return next(new ApiError(BAD_REQUEST, "You can only chat with friends"));
  }
  let newChat = await Chat.create({
    participants: [smallerId, biggerId],
  });
  if (!newChat) {
    return next(new ApiError(INTERNAL_SERVER_ERROR, "Something went wrong"));
  }
  newChat = newChat.toObject();
  res.status(CREATED).json(
    new ApiResponse(CREATED, "Chat created", {
      chatData: newChat,
      participants,
    })
  );
});

export const createGroupChat = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id.toString();
  const { participants, groupName } = req.body;
  if (!groupName || groupName.trim() === "") {
    return next(new ApiError(BAD_REQUEST, "Group name is required"));
  }
  if (
    !participants ||
    !Array.isArray(participants) ||
    participants.length < 2
  ) {
    return next(
      new ApiError(
        BAD_REQUEST,
        "participants is required and should be more than 1"
      )
    );
  }

  const validParticipantsIds = participants.filter((id) => isValidObjectId(id));
  if (participants.length !== validParticipantsIds.length) {
    return next(new ApiError(BAD_REQUEST, "Some participants are invalid"));
  }
  let users = await User.find({ _id: { $in: validParticipantsIds } })
    .select("_id name profilePic bio")
    .lean();

  if (users.length !== validParticipantsIds.length) {
    return next(new ApiError(BAD_REQUEST, "Some user do not exists"));
  }

  //checking if all the participants are friends or not
  const friendShipPairs = validParticipantsIds.map((pId) => {
    return pId.toString() < loggedInUserId
      ? { userOneId: pId, userTwoId: loggedInUserId }
      : { userOneId: loggedInUserId, userTwoId: pId };
  });
  const friendShips = await Friendship.find(
    {
      $or: friendShipPairs,
      status: "accepted",
    },
    { _id: 1 }
  ).lean();

  if (friendShips && friendShips.length !== validParticipantsIds.length) {
    return next(
      new ApiError(BAD_REQUEST, "You can only add friends to the group")
    );
  }
  validParticipantsIds.push(loggedInUserId);
  let groupChat = await Chat.create({
    chatType: "group",
    participants: validParticipantsIds,
    groupName,
    admins: [loggedInUserId],
  });
  if (!groupChat) {
    return next(new ApiError(INTERNAL_SERVER_ERROR, "Something went wrong"));
  }
  groupChat = groupChat.toObject();
  users.push({
    _id: loggedInUserId,
    name: req.user.name,
    profilePic: req.user.profilePic,
    bio: req.user.bio,
  });
  res
    .status(CREATED)
    .json(
      new ApiResponse(CREATED, "Group chat created", {
        chatData: groupChat,
        participants: users,
      })
    );
});

export const updateGroupName = asyncHandler(async (req, res, next) => {
  const { groupName, groupId } = req.body;
  if (!groupName || groupName.trim() === "") {
    return next(new ApiError(BAD_REQUEST, "Group name is required"));
  }
  const isValidId = isValidObjectId(groupId);
  if (!isValidId) {
    return next(new ApiError(BAD_REQUEST, "Invalid group id"));
  }
  const groupChat = await Chat.findById(groupId);
  if (!groupChat || groupChat.chatType !== "group") {
    return next(new ApiError(NOT_FOUND, "Group chat not found"));
  }
  const isAdmin = groupChat.admins.includes(req.user._id.toString());
  if (!isAdmin)
    return next(
      new ApiError(UNAUTHORIZED, "Only admins can change group name")
    );
  groupChat.groupName = groupName;
  await groupChat.save();
  res.status(OK).json(new ApiResponse(OK, "Group name updated"));
});

const utilityForGroupAction = async (
  groupId,
  participantIds,
  loggedInUserId
) => {
  const ids = [groupId, ...participantIds];
  if (ids.some((id) => !id || id.trim() === "")) {
    return {
      success: false,
      message: "All fields are required",
      statusCode: BAD_REQUEST,
    };
  }
  if (ids.some((id) => !isValidObjectId(id))) {
    return {
      success: false,
      message: "Invalid ids",
      statusCode: BAD_REQUEST,
    };
  }
  const groupChat = await Chat.findById(groupId);
  if (!groupChat || groupChat.chatType !== "group") {
    return {
      success: false,
      message: "Group chat not found",
      statusCode: NOT_FOUND,
    };
  }
  const isAdmin = groupChat.admins.includes(loggedInUserId);
  if (!isAdmin)
    return {
      success: false,
      message: "Only admins can perform this action",
      statusCode: UNAUTHORIZED,
    };
  return {
    success: true,
    groupChat,
  };
};

export const addParticipant = asyncHandler(async (req, res, next) => {
  const { groupId, participants } = req.body;
  const loggedInUserId = req.user._id.toString();
  if (
    !participants ||
    !Array.isArray(participants) ||
    participants.length === 0
  ) {
    return next(
      new ApiError(
        BAD_REQUEST,
        "participants is required and should be at least one"
      )
    );
  }
  const { success, message, statusCode, groupChat } =
    await utilityForGroupAction(groupId, participants, loggedInUserId);
  if (!success) return next(new ApiError(statusCode, message));

  const participantsNotInGroup = new Set();
  participants.forEach((pId) => participantsNotInGroup.add(pId));
  groupChat.participants.forEach((pId) =>
    participantsNotInGroup.delete(pId.toString())
  );

  if (participantsNotInGroup.size === 0) {
    return next(
      new ApiError(
        BAD_REQUEST,
        "All given participants are already in the group"
      )
    );
  }
  let users = await User.find({
    _id: { $in: Array.from(participantsNotInGroup) },
  })
    .select({ _id: 1, name: 1, profilePic: 1, bio: 1 })
    .lean();
  if (users.length !== participantsNotInGroup.size) {
    return next(new ApiError(NOT_FOUND, "Some participants not found"));
  }
  const friendShipPairs = Array.from(participantsNotInGroup).map((pId) => {
    return pId.toString() < loggedInUserId
      ? { userOneId: pId, userTwoId: loggedInUserId }
      : { userOneId: loggedInUserId, userTwoId: pId };
  });

  const friendships = await Friendship.find(
    {
      $or: friendShipPairs,
      status: "accepted",
    },
    { _id: 1 }
  ).lean();
  if (friendships && friendships.length !== participantsNotInGroup.size) {
    return next(new ApiError(NOT_FOUND, "You can only add friends to group"));
  }

  groupChat.participants.push(...participantsNotInGroup);
  await groupChat.save();
  res
    .status(OK)
    .json(new ApiResponse(OK, "User added to group", { participants: users }));
});

export const removeParticipant = asyncHandler(async (req, res, next) => {
  const { groupId, participantId } = req.query;
  const loggedInUserId = req.user._id.toString();

  const { success, message, statusCode, groupChat } =
    await utilityForGroupAction(groupId, [participantId], loggedInUserId);
  if (!success) return next(new ApiError(statusCode, message));

  if (loggedInUserId === participantId) {
    return next(
      new ApiError(
        BAD_REQUEST,
        "You can't remove yourself, try leaving the group"
      )
    );
  }

  const pIdx = groupChat.participants.indexOf(participantId);
  if (pIdx === -1) {
    return next(new ApiError(BAD_REQUEST, "This user is not in the group"));
  }
  groupChat.participants.splice(pIdx, 1);
  //handle case when participants become empty (delete all messages and chat)
  const aIdx = groupChat.admins.indexOf(participantId);
  if (aIdx !== -1) {
    groupChat.admins.splice(aIdx, 1);
  }
  await groupChat.save();
  res.status(OK).json(new ApiResponse(OK, "User removed from group"));
});

export const toggleAdmin = asyncHandler(async (req, res, next) => {
  const { groupId, participantId } = req.body;
  const loggedInUserId = req.user._id.toString();

  const { success, message, statusCode, groupChat } =
    await utilityForGroupAction(groupId, [participantId], loggedInUserId);
  if (!success) return next(new ApiError(statusCode, message));

  const pIdx = groupChat.participants.indexOf(participantId);
  if (pIdx === -1) {
    return next(new ApiError(BAD_REQUEST, "This user is not in the group"));
  }
  const aIdx = groupChat.admins.indexOf(participantId);
  let responseMessage = "";
  if (aIdx === -1) {
    groupChat.admins.push(participantId);
    responseMessage = "User marked as admin";
  } else {
    groupChat.admins.splice(aIdx, 1);
    responseMessage = "Admin removed";
  }
  await groupChat.save();
  res.status(OK).json(new ApiResponse(OK, responseMessage));
});

export const leaveGroup = asyncHandler(async (req, res, next) => {
  const { groupId } = req.query;
  const loggedInUserId = req.user._id.toString();
  if (!groupId || groupId.trim() === "")
    return next(new ApiError(BAD_REQUEST, "Please provide group id"));
  const groupChat = await Chat.findById(groupId);
  if (!groupChat || groupChat.chatType !== "group") {
    return next(new ApiError(NOT_FOUND, "Group chat not found"));
  }
  const pIdx = groupChat.participants.indexOf(loggedInUserId);
  if (pIdx === -1) {
    return next(new ApiError(BAD_REQUEST, "You are not in the group"));
  }
  groupChat.participants.splice(pIdx, 1);
  if (groupChat.participants.length === 0) {
    //delete all messages and chat
    return res.status(OK).json(new ApiResponse(OK, "You left the group"));
  }
  const aIdx = groupChat.admins.indexOf(loggedInUserId);
  if (aIdx !== -1) {
    groupChat.admins.splice(aIdx, 1);
  }
  if (aIdx !== -1 && groupChat.admins.length === 0) {
    groupChat.admins.push(groupChat.participants[0]);
  }
  await groupChat.save();
  res.status(OK).json(new ApiResponse(OK, "You left the group", groupChat));
});

export const updateGroupIcon = asyncHandler(async (req, res, next) => {
  const { groupId } = req.body;
  const loggedInUserId = req.user._id.toString();
  if (!groupId || groupId.trim() === "")
    return next(new ApiError(BAD_REQUEST, "Please provide group id"));
  const groupChat = await Chat.findById(groupId);
  if (!groupChat || groupChat.chatType !== "group")
    return next(new ApiError(NOT_FOUND, "Group chat not found"));
  if (!groupChat.admins.includes(loggedInUserId))
    return next(new ApiError(BAD_REQUEST, "Only admins can update group icon"));
  if (!req.file)
    return next(new ApiError(BAD_REQUEST, "Please provide a group icon"));
  const { path: picLocalPath } = req.file;
  const previousGroupIconId = groupChat.groupIcon
    ? groupChat.groupIcon.publicId
    : null;
  const response = await uploadOnCloudinary(picLocalPath, CLN_CHATICON_FOLDER);
  if (!response) {
    return next(new ApiError(BAD_REQUEST, "Failed to upload profile picture"));
  }
  groupChat.groupIcon = response;
  await groupChat.save();
  if (previousGroupIconId) {
    await deleteFromCloudinary(previousGroupIconId);
  }
  res
    .status(OK)
    .json(new ApiResponse(OK, "Profile picture uploaded", response));
});

export const searchGroupChat = asyncHandler(async (req, res, next) => {
  let { search, page } = req.body;
  if (!search || search.trim() === "")
    return next(new ApiError(BAD_REQUEST, "Please provide a search query"));
  page = isNaN(page) ? 1 : Number(page);
  if (page < 1) page = 1;
  const limit = 50;
  const loggedInUserId = req.user._id.toString();
  const groupChats = await Chat.aggregate([
    {
      $match: {
        $and: [
          { chatType: "group" },
          { participants: Types.ObjectId.createFromHexString(loggedInUserId) },
          { groupName: { $regex: search, $options: "i" } },
        ],
      },
    },
    {
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              groupName: 1,
              groupIcon: 1,
            },
          },
        ],
        total: [{ $count: "count" }],
      },
    },
  ]);
  const groupChatsData = groupChats[0].data;
  const totalGroupChats = groupChats[0].total[0]
    ? groupChats[0].total[0].count
    : 0;
  const hasMore = page * limit < totalGroupChats;
  res.status(OK).json(
    new ApiResponse(OK, "Search in groups success", {
      groupChats: groupChatsData,
      totalGroupChats,
      hasMore,
    })
  );
});

export const getAllChats = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id.toString();
  const chats = await Chat.aggregate([
    {
      $match: {
        participants: Types.ObjectId.createFromHexString(loggedInUserId),
      },
    },
    { $sort: { updatedAt: -1 } },
  ]);

  const allUniqueParticipantsIds = new Set();
  chats.forEach((chat) => {
    chat.participants.forEach((participant) => {
      allUniqueParticipantsIds.add(participant._id);
    });
  });

  const participants = await User.find(
    {
      _id: { $in: Array.from(allUniqueParticipantsIds) },
    },
    { _id: 1, name: 1, profilePic: 1, bio: 1 }
  ).lean();

  const chatIds = chats.map(ch => ch._id);
  const messagesPerChat = await Message.aggregate([
    {$match: {chatId: {$in: chatIds}}},
    {$sort: {createdAt: -1}},
    {
      $group:{
        _id: "$chatId",
        messages:{
          $push: "$$ROOT"
        }
      }
    },
    {
      $project: {
        messages: {$slice: ["$messages", 20]}
      }
    }
  ]);

  res.status(OK).json(
    new ApiResponse(OK, "Get all chats success", {
      chats,
      messagesPerChat,
      participants,
    })
  );
});

export const getChatById = asyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  if (!isValidObjectId(chatId)) {
    return next(new ApiError(BAD_REQUEST, "Invalid chat id"));
  }
  const chat = await Chat.findById(chatId)
    .populate("participants", "_id name profilePic bio")
    .lean();

  const participants = [...chat.participants];
  chat.participants = chat.participants.map((p) => p._id.toString());

  if (!chat) {
    //|| groupChat.chatType !== "group" -> initially i was getGroupChatById so i changed to getChatById
    return next(new ApiError(NOT_FOUND, "Chat not found"));
  }
  res
    .status(OK)
    .json(
      new ApiResponse(OK, "Get group chat success", {
        chatData: chat,
        participants,
      })
    );
});
