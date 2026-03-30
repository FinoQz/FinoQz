
import express from 'express';
import {
  generateCertificate,
  getUserCertificates,
  verifyCertificate,
  downloadCertificate,
  getAllCertificates
} from '../controllers/certificateController.js';
import { celebrate, Joi, Segments } from 'celebrate';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

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
router.get('/user', verifyToken(), getUserCertificates);

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
router.get('/all', verifyToken(), requireAdmin, getAllCertificates);

export default router;
