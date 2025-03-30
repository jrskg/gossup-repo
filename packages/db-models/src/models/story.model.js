import { STORY_TYPES, STORY_VISIBILITY } from '@gossup/shared-constants';
import mongoose from 'mongoose'

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: STORY_TYPES,
    required: true
  },
  content: {
    caption: String,
    text: String,
    textColor: String,
    textFont: String,
    backgroundColor: String,
    mediaUrl: String,
    duration: {
      type: Number,
      required: true
    }
  },
  visibility: {
    type: String,
    enum: STORY_VISIBILITY,
    default: 'all'
  },
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  excludedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  expireAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, { timestamps: true });

// TTL Index to auto-delete expired stories
storySchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ userId: 1, visibility: 1 });
storySchema.index({ visibility: 1, allowedUsers: 1 });
storySchema.index({ visibility: 1, excludedUsers: 1 });


export const Story = mongoose.model('Story', storySchema);