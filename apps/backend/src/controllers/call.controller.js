import { Call, User } from "@gossup/db-models";
import { BAD_REQUEST, CALL_STATUS_MODEL, CREATED, NOT_FOUND, OK } from "@gossup/shared-constants";
import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCall = asyncHandler(async(req, res, next) => {
  const {
    caller,
    callee,
    callType,
  } = req.body;

  if([caller, callee].some(id => !isValidObjectId(id))){
    return next(new ApiError(BAD_REQUEST, "Invalid users ID given"));
  }

  const call = await Call.create({
    caller,
    callee,
    callType,
  });

  res
    .status(CREATED)
    .json(new ApiResponse(CREATED, "Call created", call));
});

export const updateCall = asyncHandler(async(req, res, next) => {
  const {status, connectedAt, endedAt} = req.body;
  const callId = req.params.callId;

  if(!isValidObjectId(callId)){
    return next(new ApiError(BAD_REQUEST, "Invalid call ID given"));
  }

  if(!CALL_STATUS_MODEL.includes(status)){
    return next(new ApiError(BAD_REQUEST, "Invalid call status"));
  }

  if(connectedAt && isNaN(Date.parse(connectedAt))){
    return next(new ApiError(BAD_REQUEST, "Invalid connected at date"));
  }

  if(endedAt && isNaN(Date.parse(endedAt))){
    return next(new ApiError(BAD_REQUEST, "Invalid ended at date"));
  }

  const call = await Call.findByIdAndUpdate(callId, {
    status,
    ...(connectedAt ? {connectedAt} : {}),
    ...(endedAt ? {endedAt} : {}),
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
  const callType = req.query.tab || undefined;
  const limit = 50;

  //check for cursor it should be a valid date
  if(cursor && isNaN(Date.parse(cursor))){
    return next(new ApiError(BAD_REQUEST, "Invalid cursor date"));
  }

  //check for call type
  if(callType && !["missed", "incoming", "outgoing", "all"].includes(callType)){
    return next(new ApiError(BAD_REQUEST, "Invalid call type"));
  }

  let query;
  if(!callType || callType === "all") query = {
    $or:[ {caller: userId}, {callee: userId}]
  }
  else if(callType === "missed") query = {
    callee: userId,
    status: "missed"
  }
  else if(callType === "incoming") query = {
    callee: userId
  }
  else if(callType === "outgoing") query = {
    caller: userId
  }

  query = {
    ...query,
    ...(cursor ? {createdAt: {$lt: new Date(cursor)}} : {})
  }

  const calls = await Call.find(query, {__v: 0})
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