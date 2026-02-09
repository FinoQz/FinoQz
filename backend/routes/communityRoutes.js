const express = require('express');
const router = express.Router();
const {
  createPost,
  updatePost,
  deletePost,
  getPosts,
  getPostById,
  togglePin,
  likePost
} = require('../controllers/communityController');
const { celebrate, Joi, Segments } = require('celebrate');
const verifyToken = require('../middlewares/verifyToken');
const requireAdmin = require('../middlewares/requireAdmin');

// Get all posts (public - authenticated users)
router.get('/posts', verifyToken(), getPosts);

// Get single post by ID
router.get('/posts/:postId',
  verifyToken(),
  celebrate({
    [Segments.PARAMS]: Joi.object({
      postId: Joi.string().required()
    })
  }),
  getPostById
);

// Create new post (Admin only)
router.post('/posts',
  verifyToken(),
  requireAdmin,
  celebrate({
    [Segments.BODY]: Joi.object({
      title: Joi.string().required().max(200),
      content: Joi.string().required(),
      category: Joi.string().valid('Announcements', 'Tips', 'Updates', 'General').optional(),
      status: Joi.string().valid('draft', 'published', 'archived').optional(),
      isPinned: Joi.boolean().optional(),
      tags: Joi.array().items(Joi.string()).optional()
    })
  }),
  createPost
);

// Update post (Admin only)
router.put('/posts/:postId',
  verifyToken(),
  requireAdmin,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      postId: Joi.string().required()
    }),
    [Segments.BODY]: Joi.object({
      title: Joi.string().max(200).optional(),
      content: Joi.string().optional(),
      category: Joi.string().valid('Announcements', 'Tips', 'Updates', 'General').optional(),
      status: Joi.string().valid('draft', 'published', 'archived').optional(),
      isPinned: Joi.boolean().optional(),
      tags: Joi.array().items(Joi.string()).optional()
    })
  }),
  updatePost
);

// Delete post (Admin only)
router.delete('/posts/:postId',
  verifyToken(),
  requireAdmin,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      postId: Joi.string().required()
    })
  }),
  deletePost
);

// Toggle pin status (Admin only)
router.patch('/posts/:postId/pin',
  verifyToken(),
  requireAdmin,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      postId: Joi.string().required()
    })
  }),
  togglePin
);

// Like a post
router.post('/posts/:postId/like',
  verifyToken(),
  celebrate({
    [Segments.PARAMS]: Joi.object({
      postId: Joi.string().required()
    })
  }),
  likePost
);

module.exports = router;
