
import express from 'express';
import {
  createPost,
  updatePost,
  deletePost,
  getPosts,
  getPostById,
  togglePin,
  likePost,
  getPostLikes,
  sharePost,
  featurePost,
  flagPost
} from '../controllers/communityController.js';
import {
  addComment,
  getComments,
  deleteComment,
  likeComment
} from '../controllers/commentController.js';
import auth from '../middlewares/authMiddleware.js';
import admin from '../middlewares/adminAuth.js';

const router = express.Router();

// Public
router.get('/posts', getPosts);
router.get('/posts/:postId', getPostById);
router.get('/comments/:postId', getComments);

// User
router.post('/posts', auth, createPost);
router.put('/posts/:postId', auth, updatePost);
router.delete('/posts/:postId', auth, deletePost);
router.post('/posts/:postId/like', auth, likePost);
router.get('/posts/:postId/likes', auth, getPostLikes);
router.post('/posts/:postId/share', auth, sharePost);
router.post('/posts/:postId/flag', auth, flagPost);

router.post('/comments', auth, addComment);
router.delete('/comments/:commentId', auth, deleteComment);
router.post('/comments/:commentId/like', auth, likeComment);

// Admin
router.patch('/posts/:postId/pin', auth, admin, togglePin);
router.patch('/posts/:postId/feature', auth, admin, featurePost);

export default router;
