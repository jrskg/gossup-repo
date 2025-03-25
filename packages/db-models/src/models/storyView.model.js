import { EMOJI_TYPE } from '@gossup/shared-constants';
import mongoose from 'mongoose'

const storyViewSchema = new mongoose.Schema({
  storyId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  viewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reactions: [{
    type: String,
    enum: EMOJI_TYPE
  }]
}, { timestamps: true });

storyViewSchema.index({ storyId: 1, viewedBy: 1 }, {unique: true});

export const StoryView = mongoose.model('StoryView', storyViewSchema);