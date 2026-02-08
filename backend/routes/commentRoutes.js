const express = require('express');
const router = express.Router();
const {
  addComment,
  getComments,
  deleteComment,
  likeComment
} = require('../controllers/commentController');
const { celebrate, Joi, Segments } = require('celebrate');
const verifyToken = require('../middlewares/verifyToken');

// Add a comment
router.post('/',
  verifyToken,
  celebrate({
    [Segments.BODY]: Joi.object({
      postId: Joi.string().required(),
      content: Joi.string().required().max(1000),
      parentCommentId: Joi.string().optional()
    })
  }),
  addComment
);

// Get comments for a post
router.get('/:postId',
  verifyToken,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      postId: Joi.string().required()
    })
  }),
  getComments
);

// Delete a comment
router.delete('/:commentId',
  verifyToken,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      commentId: Joi.string().required()
    })
  }),
  deleteComment
);

// Like a comment
router.post('/:commentId/like',
  verifyToken,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      commentId: Joi.string().required()
    })
  }),
  likeComment
);

module.exports = router;
