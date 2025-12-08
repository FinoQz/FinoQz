const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profilePictures");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;
// const multer = require("multer");

// // Use memory storage instead of disk
// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     // ✅ Allow only images
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image files are allowed!"), false);
//     }
//   },
//   limits: {
//     fileSize: 2 * 1024 * 1024, // ✅ Max 2MB
//   },
// });

// module.exports = upload;
