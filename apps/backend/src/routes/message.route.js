import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { 
  getMessagesOfChat, 
  getUploadSignature, 
  getUploadSignatureWithConfiguration,  
} from "../controllers/message.controller.js";
// import { attachmentsUploadMulter } from "../middlewares/multer.middleware.js";
// import { MAX_ATTACHMENT_COUNT } from "../configs/env.index.js";

const router = express.Router();
router.use(authenticate);

// router
//   .route("/attachments/upload")
//   .post(
//     authenticate,
//     attachmentsUploadMulter.array("files", MAX_ATTACHMENT_COUNT),
//     uploadAttachments
//   );

router.route("/get-signature")
  .get(authenticate, getUploadSignature)
  .post(authenticate, getUploadSignatureWithConfiguration);
router.route("/all").get(authenticate, getMessagesOfChat);

export default router;
