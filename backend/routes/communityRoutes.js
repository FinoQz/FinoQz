const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/communityController');

const {
  addComment,
  getComments,
  deleteComment,
  likeComment
} = require('../controllers/commentController');

// TODO: replace with your actual auth middleware paths
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminAuth');

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

module.exports = router;
