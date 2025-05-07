import { CALL_STATUS_MODEL, CALL_TYPE_MODEL } from "@gossup/shared-constants"
import mongoose from "mongoose"

const callSchema = new mongoose.Schema({
  caller:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  callee:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status:{
    type: String,
    enum: CALL_STATUS_MODEL,
    required: true
  },
  callType:{
    type: String,
    enum: CALL_TYPE_MODEL,
    required: true
  },
  callDuration: {
    type: Number,
    required: true
  }
}, {timestamps: true})

callSchema.index({caller: 1, createdAt: -1})
callSchema.index({callee: 1, createdAt: -1})

export const Call = mongoose.model("Call", callSchema);

