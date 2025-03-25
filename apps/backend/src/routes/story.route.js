import express from 'express'
import { authenticate } from '../middlewares/auth.middleware.js';
import { 
  createStory, 
  deleteStory, 
  getFriendsStory, 
  getMyStories,
  reactOnFriendsStory,
  viewFriendsStory
} from '../controllers/story.controller.js';

const router = express.Router();

router.route("/create").post(authenticate, createStory);
router.route("/all").get(authenticate, getFriendsStory);
router.route("/mine/all").get(authenticate, getMyStories);
router.route("/mine/:storyId").delete(authenticate, deleteStory);
router.route("/:storyId")
  .put(authenticate, viewFriendsStory)
  .post(authenticate, reactOnFriendsStory);

export default router;