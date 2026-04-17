import express from 'express';
import { getForumTags, createForumTag, deleteForumTag } from '../controllers/forumTagController.js';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// Public / Authenticated read
router.get('/', verifyToken(), getForumTags);

// Admin modify
router.post('/', verifyToken(), requireAdmin, createForumTag);
router.delete('/:id', verifyToken(), requireAdmin, deleteForumTag);

export default router;
