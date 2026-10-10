import express from "express"

import { createCollaboration, joinCollaboration, initializeCollaboration } from "../controllers/collaboration.controller.js"

import { requireAuth } from "../middleware/auth.middleware.js"

const router = express.Router();

router.post('/:repoId', requireAuth,createCollaboration)
router.get("/join/:inviteToken",joinCollaboration)
router.post(
    "/:sessionID/initialize",
    requireAuth,
    initializeCollaboration
);

export default router