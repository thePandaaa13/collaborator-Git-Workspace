import express from "express";

import { getRepositories,getRepository,getRepositoryTree,getFile,saveFile } from "../controllers/repository.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getRepositories);
router.get('/:repoId',requireAuth, getRepository);
router.get("/:repoId/tree",requireAuth,getRepositoryTree);
router.get("/:repoId/file",requireAuth,getFile)
router.put("/:repoId/file",requireAuth, saveFile)



export default router;