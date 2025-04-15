import { STORY_VISIBILITY } from '@gossup/shared-constants';
import mongoose from 'mongoose';

const userPrivacySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  storyPrivacy:{
    visibility: {
      type: String,
      enum: STORY_VISIBILITY,
      default: 'all',
    },
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    excludedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }]
  }
});

userPrivacySchema.index({ userId: 1 }, { unique: true });

export const UserPrivacy = mongoose.model('UserPrivacy', userPrivacySchema);
