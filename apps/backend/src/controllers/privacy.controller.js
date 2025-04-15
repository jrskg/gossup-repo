import {Friendship, User, UserPrivacy} from "@gossup/db-models";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BAD_REQUEST, OK, STORY_VISIBILITY } from "@gossup/shared-constants";

export const getUserPrivacy = asyncHandler(async(req, res, next) => {
  const userId = req.user._id;
  const privacy = await UserPrivacy
    .findOne({userId})
    .populate("storyPrivacy.allowedUsers storyPrivacy.excludedUsers", "name profilePic")
    .lean();

  if(!privacy) {
    return next(new ApiError(BAD_REQUEST, "Privacy not found"));
  }
  res.status(OK).json(new ApiResponse(OK, "Privacy fetched", privacy));
});

export const updateStoryPrivacy = asyncHandler(async(req, res, next) => {
  const userId = req.user._id;
  const { visibility, allowedUsers, excludedUsers } = req.body;
  if(!STORY_VISIBILITY.includes(visibility)) {
    return next(new ApiError(BAD_REQUEST, "Invalid visibility"));
  }
  const privacy = await UserPrivacy.findOneAndUpdate(
    { userId },
    { storyPrivacy: { visibility, allowedUsers, excludedUsers } },
    { new: true }
  );
  if(!privacy) {
    return next(new ApiError(BAD_REQUEST, "Privacy not found"));
  }
  res.status(OK).json(new ApiResponse(OK, "Privacy updated", privacy));
});

export const createPrivacyForCurrentUserTemp = asyncHandler(async(req, res, next) => {
  const userId = req.user._id;
  const privacy = await UserPrivacy.create({
    userId,
    storyPrivacy: {
      visibility: "all",
      allowedUsers: [],
      excludedUsers: []
    }
  });
  if(!privacy) {
    return next(new ApiError(BAD_REQUEST, "Privacy not created"));
  }
  res.status(OK).json(new ApiResponse(OK, "Privacy created", privacy));
});