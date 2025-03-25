import { Friendship, Story, StoryView } from "@gossup/db-models";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  BAD_REQUEST,
  EMOJI_TYPE,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
  STORY_TYPES,
  STORY_VISIBILITY,
  UNAUTHORIZED,
} from "@gossup/shared-constants";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";

export const createStory = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { type, content, visibility, allowedUsers, excludedUsers } = req.body;
  if (!type || !STORY_TYPES.includes(type)) {
    return next(new ApiError(BAD_REQUEST, "Invalid story types"));
  }
  if (type.trim() === "text" && (!content.text || !content.backgroundColor)) {
    return next(new ApiError(BAD_REQUEST, "Invalid data for text status"));
  }
  if (type.trim() !== "text" && !content.mediaUrl) {
    return next(new ApiError(BAD_REQUEST, "Invalid data for media status"));
  }
  if (!STORY_VISIBILITY.includes(visibility)) {
    return next(new ApiError(BAD_REQUEST, "Invalid visibility"));
  }
  const story = await Story.create({
    userId,
    type: type.trim(),
    content,
    visibility,
    allowedUsers,
    excludedUsers,
  });

  if (!story) {
    return next(
      new ApiError(
        INTERNAL_SERVER_ERROR,
        "Something went wrong while creating story"
      )
    );
  }

  res.status(OK).json(new ApiResponse(OK, "Story created successfully", story));
});

export const getFriendsStory = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  let page = Number(req.query?.page);
  if (isNaN(page) || page < 1) page = 1;
  const limit = 20;

  const query = {
    $or: [
      { userOneId: new mongoose.Types.ObjectId(userId) },
      { userTwoId: new mongoose.Types.ObjectId(userId) },
    ],
    status: "accepted",
  };

  const friends = await Friendship.find(query, {
    userOneId: 1,
    userTwoId: 1,
  })
    .lean()
    .catch(() => []);

  if (!friends.length) {
    return res.status(OK).json(
      new ApiResponse(OK, "No stories available", {
        stories: [],
        totalStoryCounts: 0,
      })
    );
  }

  const friendsId = friends.map((f) =>
    f.userOneId === userId ? f.userTwoId : f.userOneId
  );

  const pipeline = [
    {
      $match: {
        userId: { $in: friendsId },
        $or: [
          { visibility: "all" },
          {
            visibility: "only",
            allowedUsers: userId,
          },
          {
            visibility: "except",
            excludedUsers: { $nin: [userId] },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "storyviews",
        let: { storyId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$storyId", "$$storyId"] },
                  { $eq: ["$viewedBy", new mongoose.Types.ObjectId(userId)] },
                ],
              },
            },
          },
        ],
        as: "viewedStory",
      },
    },
    {
      $addFields: {
        hasViewed: { $gt: [{ $size: "$viewedStory" }, 0] },
        reactions: { $ifNull: ["$viewedStory.reactions", []] },
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    { $unset: "viewedStory" },
  ];

  const [result] = await Story.aggregate([
    ...pipeline,
    {
      $facet: {
        stories: [{ $match: {} }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  res.status(OK).json(
    new ApiResponse(OK, "Stories fetched", {
      stories: result.stories,
      totalStoryCounts: result.totalCount[0]?.count || 0,
    })
  );

  // if (friendsId.length === 0) {
  //   return res
  //     .status(NOT_FOUND)
  //     .json(new ApiError(NOT_FOUND, "No friends found"));
  // }

  // const totalStoryCounts = await Story.countDocuments({
  //   userId: { $in: friendsId },
  // });

  // const stories = await Story.find({
  //   userId: { $in: friendsId },
  // })
  //   .skip((page - 1) * limit)
  //   .limit(limit)
  //   .lean();

  // const storiesToBeSent = [];
  // stories.forEach((story) => {
  //   switch (story.visibility) {
  //     case "all":
  //       storiesToBeSent.push(story);
  //       break;
  //     case "only":
  //       if (story.allowedUsers.includes(userId)) storiesToBeSent.push(story);
  //       break;
  //     case "except":
  //       if (!story.excludedUsers.includes(userId)) storiesToBeSent.push(story);
  //       break;
  //     default:
  //       break;
  //   }
  // });
  // const storyViewed = await storyView
  //   .find(
  //     {
  //       storyId: { $in: storiesToBeSent.map((s) => s._id) },
  //       viewedBy: userId,
  //     },
  //     { reactions: 1 }
  //   )
  //   .lean();
  // const storyViewedMap = new Map(
  //   storyViewed.map((s) => [s.storyId.toString(), s.reactions])
  // );

  // storiesToBeSent.forEach((story) => {
  //   const hasViewed = storyViewedMap.get(story._id.toString());
  //   if (hasViewed) {
  //     story.hasViewed = true;
  //     story.reactions = hasViewed;
  //   } else {
  //     story.hasViewed = false;
  //     story.reactions = [];
  //   }
  // });
});

export const getMyStories = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const stories = await Story.aggregate([
    {
      $match: { userId },
    },
    {
      $lookup: {
        from: "storyviews",
        let: { storyId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$storyId", "$$storyId"],
              },
            },
          },
        ],
        as: "views",
      },
    },
    {
      $project: {
        expireAt: 0,
        __v: 0,
      },
    },
  ]);

  res.status(OK).json(new ApiResponse(OK, "Stories fetched", stories));
});

export const deleteStory = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { storyId } = req.params;
  if (!storyId || !isValidObjectId(storyId)) {
    return next(new ApiError(BAD_REQUEST, "Invalid story id"));
  }

  const story = await Story.findById(storyId);
  if (!story) {
    return next(new ApiError(NOT_FOUND, "Story not found"));
  }
  if (story.userId.toString() !== userId.toString()) {
    return next(
      new ApiError(UNAUTHORIZED, "You are not allowed to delete this story")
    );
  }
  await story.deleteOne();
  await StoryView.deleteMany({ storyId });
  res.status(OK).json(new ApiResponse(OK, "Story deleted"));
});

export const viewFriendsStory = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { storyId } = req.params;
  if (!storyId || !isValidObjectId(storyId)) {
    return next(new ApiError(BAD_REQUEST, "Invalid story id"));
  }

  const story = await Story.findById(storyId);
  if (!story) {
    return next(new ApiError(NOT_FOUND, "Story not found"));
  }

  const storyView = await StoryView.updateOne(
    { storyId, viewedBy: userId },
    { $setOnInsert: { storyId, viewedBy: userId, reactions: [] } },
    { upsert: true }
  );

  if (!storyView) {
    return next(new ApiError(INTERNAL_SERVER_ERROR, "Something went wrong"));
  }

  res.status(OK).json(new ApiResponse(OK, "Story viewed"));
});

export const reactOnFriendsStory = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { storyId } = req.params;
  const { reactions } = req.body;
  if (!storyId || !isValidObjectId(storyId)) {
    return next(new ApiError(BAD_REQUEST, "Invalid story id"));
  }

  if (!reactions || !Array.isArray(reactions) || reactions.some(r => !EMOJI_TYPE.includes(r))) {
    return next(new ApiError(BAD_REQUEST, "Invalid reaction"));
  }

  let storyView = await StoryView.findOneAndUpdate(
    { storyId, viewedBy: userId },
    { $setOnInsert: { storyId, viewedBy: userId, reactions: [] } },
    { upsert: true, new: true }
  );

  storyView.reactions.push(...reactions);
  storyView.reactions.splice(0, storyView.reactions.length - 5);
  await storyView.save();

  res.status(OK).json(new ApiResponse(OK, "Reacted on story"));
});
