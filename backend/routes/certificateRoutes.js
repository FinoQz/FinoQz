const express = require('express');
const router = express.Router();
const {
  generateCertificate,
  getUserCertificates,
  verifyCertificate,
  downloadCertificate,
  getAllCertificates
} = require('../controllers/certificateController');
const { celebrate, Joi, Segments } = require('celebrate');
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');

// Generate certificate
router.post('/generate',
  verifyToken,
  celebrate({
    [Segments.BODY]: Joi.object({
      attemptId: Joi.string().required()
    })
  }),
  generateCertificate
);

// Get user's certificates
router.get('/user', verifyToken, getUserCertificates);

// Verify certificate by code (public route)
router.get('/verify/:verificationCode',
  celebrate({
    [Segments.PARAMS]: Joi.object({
      verificationCode: Joi.string().required()
    })
  }),
  verifyCertificate
);

// Download certificate
router.get('/:certificateId/download',
  verifyToken,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      certificateId: Joi.string().required()
    })
  }),
  downloadCertificate
);

// Get all certificates (Admin only)
router.get('/all', verifyToken, verifyAdmin, getAllCertificates);

module.exports = router;
