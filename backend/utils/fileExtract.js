'use strict';

/**
 * Utilities to extract text from uploaded files (PDF, DOCX, TXT).
 *
 * Install:
 *   npm i pdf-parse mammoth
 *
 * - pdf-parse: extracts text from PDFs
 * - mammoth: extracts text from docx
 *
 * Fallback: returns empty string on unsupported file types.
 */

const fs = require('fs').promises;
const path = require('path');

async function extractTextFromPDF(filepath) {
  const pdfParse = require('pdf-parse');
  const data = await fs.readFile(filepath);
  const result = await pdfParse(data);
  return result.text || '';
}

async function extractTextFromDocx(filepath) {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ path: filepath });
  return result.value || '';
}

async function extractTextFromTxt(filepath) {
  const txt = await fs.readFile(filepath, 'utf8');
  return txt;
}

async function extractText(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  try {
    if (ext === '.pdf') return await extractTextFromPDF(filepath);
    if (ext === '.docx') return await extractTextFromDocx(filepath);
    if (ext === '.txt') return await extractTextFromTxt(filepath);
    // if new types are required (pptx, html) add them here
    return '';
  } catch (err) {
    console.error('extractText error', err);
    return '';
  }
}

module.exports = { extractText };