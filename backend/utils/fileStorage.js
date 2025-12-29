const fs = require('fs').promises;
const path = require('path');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

async function saveUploadedFile(file, { prefix = '' } = {}) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.originalname);
  const filename = `${prefix}${Date.now()}${ext}`;
  const destPath = path.join(UPLOAD_DIR, filename);

  await fs.rename(file.path, destPath);
  return filename;
}

module.exports = { saveUploadedFile };
