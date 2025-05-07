import express from "express"
import { authenticate } from "../middlewares/auth.middleware.js";
import { createCall, getCallLogs, updateCall } from "../controllers/call.controller.js";

const router = express.Router();
router.use(authenticate);

router.route("/create").post(createCall);
router.route("/:callId").put(updateCall);
router.route("/logs").put(getCallLogs);

export default router;