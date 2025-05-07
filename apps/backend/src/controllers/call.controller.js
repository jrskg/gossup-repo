import { isValidObjectId, set, Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { BAD_REQUEST, CALL_STATUS_MODEL, CALL_TYPE_MODEL, CREATED, NOT_FOUND, OK } from "@gossup/shared-constants";
import { Call, User } from "@gossup/db-models";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createCall = asyncHandler(async(req, res, next) => {
  const {
    caller,
    callee,
    status,
    callType,
    callDuration
  } = req.body;

  if([caller, callee].some(id => !isValidObjectId(id))){
    return next(new ApiError(BAD_REQUEST, "Invalid users ID given"));
  }
  if(!CALL_STATUS_MODEL.includes(status) || !CALL_TYPE_MODEL.includes(callType)){
    return next(new ApiError(BAD_REQUEST, "Invalid call status or type"));
  }

  if(callDuration && (isNaN(callDuration) || callDuration < 0)){
    return next(new ApiError(BAD_REQUEST, "Invalid call duration"));
  }

  const call = await Call.create({
    caller,
    callee,
    status,
    callType,
    callDuration: callDuration || undefined
  });

  res
    .status(CREATED)
    .json(new ApiResponse(CREATED, "Call created", call));
});

export const updateCall = asyncHandler(async(req, res, next) => {
  const {status, callDuration} = req.body;
  const callId = req.params.callId;

  if(!isValidObjectId(callId)){
    return next(new ApiError(BAD_REQUEST, "Invalid call ID given"));
  }

  if(!CALL_STATUS_MODEL.includes(status)){
    return next(new ApiError(BAD_REQUEST, "Invalid call status"));
  }

  if(!callDuration || isNaN(callDuration) || callDuration < 0){
    return next(new ApiError(BAD_REQUEST, "Invalid call duration"));
  }

  const call = await Call.findByIdAndUpdate(callId, {
    status,
    callDuration
  }, {new: true}).lean();

  if(!call){
    return next(new ApiError(NOT_FOUND, "Call not found"));
  }

  res
    .status(OK)
    .json(new ApiResponse(OK, "Call updated", call));
})

export const getCallLogs = asyncHandler(async(req, res, next) => {
  const userId = req.user._id;
  const cursor = req.query.cursor || undefined;
  const limit = 50;

  const query = {
    $or: [
      {caller: Types.ObjectId.createFromHexString(userId)},
      {callee: Types.ObjectId.createFromHexString(userId)},
    ],
    ...(cursor ? {createdAt: {$lt: new Date(cursor)}} : {})
  }

  const calls = await Call.find(query)
    .sort({createdAt: -1})
    .limit(limit + 1)
    .lean();

  if (calls.length === 0){
    res.status(OK).json(new ApiResponse(OK, "No calls found", {
      calls: [],
      hasMore: false,
      users: [],
      cursor: null
    }));
    return
  }

  const hasMore = calls.length > limit;
  if(hasMore){
    calls.pop();
  }
  
  const userIds = calls.reduce((acc, call) => {
    acc.add(call.caller);
    acc.add(call.callee);
    return acc;
  }, new Set());

  const users = await User.find(
    { _id: { $in: [...userIds] }},
    {_id: 1, name: 1, profilePic: 1}
  ).lean();

  res.status(OK).json(new ApiResponse(OK, "Get calls success", {
    calls,
    hasMore,
    users,
    cursor: hasMore ? calls[calls.length - 1].createdAt : null
  }));
});