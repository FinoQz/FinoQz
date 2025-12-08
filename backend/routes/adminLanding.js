// 'use strict';

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const LandingPage = require('../models/LandingPage');
// const adminAuth = require('../middlewares/authMiddleware')('admin');

// // storage setup for hero images (local disk)
// const uploadDir = path.join(process.cwd(), 'uploads', 'landing');
// fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname).toLowerCase();
//     const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
//     cb(null, safe);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter: (req, file, cb) => {
//     const allowed = ['.png', '.jpg', '.jpeg', '.webp','.svg'];
//     const ext = path.extname(file.originalname).toLowerCase();
//     cb(null, allowed.includes(ext));
//   },
// });

// // GET /admin/landing
// // Public endpoint? In your frontend you requested admin fetching using adminToken.
// // Here we allow public GET (for site) and admin GET with adminAuth will return same data.
// // We'll keep GET public so landing page can fetch it without admin token.
// router.get('/', async (req, res) => {
//   try {
//     let doc = await LandingPage.findOne({});
//     if (!doc) {
//       doc = new LandingPage({
//         hero: {
//           title: 'FinoQz',
//           subtitle: 'Where Smart Finance Learning Becomes a Daily Habit',
//           ctaText: 'Try Free Quiz',
//           ctaLink: '/quiz',
//           imageUrl: null,
//         },
//         categories: [],
//         whyCards: [],
//         dummyQuiz: null,
//       });
//       await doc.save();
//     }
//     res.json(doc);
//   } catch (err) {
//     console.error('GET /admin/landing error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // POST /admin/landing
// // Requires admin auth, updates the single landing page doc
// router.post('/', adminAuth, upload.single('heroImage'), async (req, res) => {
//   try {
//     // payload is JSON string
//     const payloadRaw = req.body.payload;
//     if (!payloadRaw) return res.status(400).json({ message: 'Missing payload' });

//     let payload;
//     try {
//       payload = JSON.parse(payloadRaw);
//     } catch (err) {
//       return res.status(400).json({ message: 'Invalid payload JSON' });
//     }

//     // find or create doc
//     let doc = await LandingPage.findOne({});
//     if (!doc) {
//       doc = new LandingPage();
//     }

//     // merge hero, categories, whyCards, dummyQuiz
//     if (payload.hero) {
//       doc.hero = {
//         ...doc.hero.toObject ? doc.hero.toObject() : doc.hero,
//         ...payload.hero,
//       };
//     }
//     if (Array.isArray(payload.categories)) {
//       doc.categories = payload.categories;
//     }
//     if (Array.isArray(payload.whyCards)) {
//       doc.whyCards = payload.whyCards;
//     }
//     if (payload.dummyQuiz) {
//       doc.dummyQuiz = payload.dummyQuiz;
//     }

//     // handle uploaded file
//     if (req.file) {
//       const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
//       const fileUrl = `${baseUrl}/uploads/landing/${req.file.filename}`;
//       doc.hero = doc.hero || {};
//       doc.hero.imageUrl = fileUrl;
//     }

//     await doc.save();

//     res.json({ message: 'Landing page updated', landing: doc });
//   } catch (err) {
//     console.error('POST /admin/landing error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;
'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const LandingPage = require('../models/LandingPage');
const adminAuth = require('../middlewares/authMiddleware')('admin');

const uploadDir = path.join(process.cwd(), 'uploads', 'landing');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  },
});

// GET (public)
router.get('/', async (req, res) => {
  try {
    let doc = await LandingPage.findOne({});
    if (!doc) {
      doc = new LandingPage({
        hero: { title: 'FinoQz', subtitle: 'Where Smart Finance Learning Becomes a Daily Habit', ctaText: 'Try Free Quiz', ctaLink: '/quiz', imageUrl: null },
        categories: [],
        whyCards: [],
        dummyQuiz: null,
      });
      await doc.save();
    }
    return res.json(doc);
  } catch (err) {
    console.error('GET /admin/landing error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST (admin) with upload
router.post('/', adminAuth, upload.single('heroImage'), async (req, res) => {
  try {
    const payloadRaw = req.body.payload;
    if (!payloadRaw) return res.status(400).json({ message: 'Missing payload' });

    let payload;
    try { payload = JSON.parse(payloadRaw); } 
    catch (err) { return res.status(400).json({ message: 'Invalid JSON payload' }); }

    let doc = await LandingPage.findOne({});
    if (!doc) doc = new LandingPage();

    // merge hero
    if (payload.hero) {
      doc.hero = { ...(doc.hero?.toObject ? doc.hero.toObject() : doc.hero), ...payload.hero };
    }
    if (Array.isArray(payload.categories)) doc.categories = payload.categories;
    if (Array.isArray(payload.whyCards)) doc.whyCards = payload.whyCards;
    if (payload.dummyQuiz) doc.dummyQuiz = payload.dummyQuiz;

    // If we have a new file, remove old local file (if any) then set new URL
    if (req.file) {
      try {
        // delete old local file if it points to /uploads/landing/...
        if (doc.hero && doc.hero.imageUrl && doc.hero.imageUrl.includes('/uploads/landing/')) {
          const oldFilename = doc.hero.imageUrl.split('/uploads/landing/').pop();
          const oldPath = path.join(uploadDir, oldFilename || '');
          if (oldFilename && fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log('Deleted old hero image:', oldPath);
          }
        }
      } catch (err) {
        console.warn('Old file cleanup failed', err);
      }

      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}/uploads/landing/${req.file.filename}`;
      doc.hero = doc.hero || {};
      doc.hero.imageUrl = fileUrl;
      console.log('Uploaded hero image saved as:', req.file.filename, '->', fileUrl);
    }

    await doc.save();
    console.log('Landing doc updated at', doc.updatedAt);

    return res.json({ message: 'Landing page updated', landing: doc });
  } catch (err) {
    console.error('POST /admin/landing error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;