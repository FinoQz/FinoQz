const Certificate = require('../models/Certificate');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * Generate a unique certificate number
 */
const generateCertificateNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CERT-${timestamp}-${random}`;
};

/**
 * Generate a unique verification code
 */
const generateVerificationCode = () => {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
};

/**
 * Generate certificate for a quiz attempt
 * @route POST /api/certificates/generate
 */
const generateCertificate = async (req, res) => {
  try {
    const { attemptId } = req.body;
    const userId = req.user._id;

    // Get attempt details
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId })
      .populate('quizId')
      .populate('userId');

    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    if (attempt.status !== 'submitted') {
      return res.status(400).json({ message: 'Quiz attempt not completed' });
    }

    // Check if user passed (e.g., 50% minimum)
    if (attempt.percentage < 50) {
      return res.status(400).json({ message: 'Minimum score not achieved for certificate' });
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ attemptId });
    if (existingCert) {
      return res.json({
        message: 'Certificate already exists',
        certificate: existingCert
      });
    }

    // Generate certificate
    const certificate = await Certificate.create({
      userId: attempt.userId._id,
      quizId: attempt.quizId._id,
      attemptId: attempt._id,
      certificateNumber: generateCertificateNumber(),
      issueDate: new Date(),
      score: attempt.totalScore,
      percentage: attempt.percentage,
      verificationCode: generateVerificationCode()
      // certificateUrl will be added when PDF is generated
    });

    // Mark attempt as certificate issued
    attempt.certificateIssued = true;
    await attempt.save();

    // Here you would generate the actual PDF
    // For now, we'll just return the certificate data
    // const pdfUrl = await generateCertificatePDF(certificate);
    // certificate.certificateUrl = pdfUrl;
    // await certificate.save();

    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
};

/**
 * Get user's certificates
 * @route GET /api/certificates/user
 */
const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const certificates = await Certificate.find({ userId })
      .populate('quizId', 'quizTitle category')
      .sort({ issueDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Certificate.countDocuments({ userId });

    res.json({
      certificates,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get user certificates error:', error);
    res.status(500).json({ message: 'Failed to fetch certificates' });
  }
};

/**
 * Verify certificate by verification code
 * @route GET /api/certificates/verify/:verificationCode
 */
const verifyCertificate = async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const certificate = await Certificate.findOne({ verificationCode })
      .populate('userId', 'fullName email')
      .populate('quizId', 'quizTitle category totalMarks');

    if (!certificate) {
      return res.status(404).json({ 
        valid: false,
        message: 'Certificate not found' 
      });
    }

    res.json({
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        userName: certificate.userId.fullName,
        quizTitle: certificate.quizId.quizTitle,
        category: certificate.quizId.category,
        score: certificate.score,
        percentage: certificate.percentage,
        issueDate: certificate.issueDate
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ message: 'Failed to verify certificate' });
  }
};

/**
 * Download certificate PDF
 * @route GET /api/certificates/:certificateId/download
 */
const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user._id;

    const certificate = await Certificate.findOne({ _id: certificateId, userId })
      .populate('userId', 'fullName')
      .populate('quizId', 'quizTitle category');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // If PDF already exists, return the URL
    if (certificate.certificateUrl) {
      return res.json({
        message: 'Certificate available',
        url: certificate.certificateUrl
      });
    }

    // Generate PDF (placeholder - actual implementation would use pdfkit)
    // const pdfBuffer = await generateCertificatePDF(certificate);
    
    // For now, return certificate data
    res.json({
      message: 'Certificate data',
      certificate: {
        certificateNumber: certificate.certificateNumber,
        userName: certificate.userId.fullName,
        quizTitle: certificate.quizId.quizTitle,
        score: certificate.score,
        percentage: certificate.percentage,
        issueDate: certificate.issueDate,
        verificationCode: certificate.verificationCode
      }
    });
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ message: 'Failed to download certificate' });
  }
};

/**
 * Get all certificates (Admin only)
 * @route GET /api/certificates/all
 */
const getAllCertificates = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query = {};
    if (search) {
      // Search by certificate number or verification code
      query.$or = [
        { certificateNumber: { $regex: search, $options: 'i' } },
        { verificationCode: { $regex: search, $options: 'i' } }
      ];
    }

    const certificates = await Certificate.find(query)
      .populate('userId', 'fullName email')
      .populate('quizId', 'quizTitle category')
      .sort({ issueDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Certificate.countDocuments(query);

    res.json({
      certificates,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get all certificates error:', error);
    res.status(500).json({ message: 'Failed to fetch certificates' });
  }
};

module.exports = {
  generateCertificate,
  getUserCertificates,
  verifyCertificate,
  downloadCertificate,
  getAllCertificates
};
