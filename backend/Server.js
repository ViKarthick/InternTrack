const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { spawn } = require('child_process');

const app = express();
const PORT = 5000;

// In Docker, OCR_SERVICE_URL is set by docker-compose.yml to http://ocr_service:5001
// (containers reach each other by service name, not localhost).
// Locally without Docker, it falls back to 127.0.0.1.
const OCR_SERVICE_BASE = process.env.OCR_SERVICE_URL || 'http://127.0.0.1:5001';
const OCR_URL = `${OCR_SERVICE_BASE}/verify`;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are supported.'));
  }
});

app.get('/', (_req, res) => {
  res.json({ service: 'InternTrack backend', status: 'running' });
});

app.post('/upload-file', upload.single('pdfFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ result: 'error', message: 'No file uploaded.' });
  }

  res.json({
    result: 'success',
    fileName: req.file.filename,
    path: req.file.path
  });
});

app.post('/api/verify-document', upload.single('pdfFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      result: 'error',
      message: 'No PDF document supplied.'
    });
  }

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path));
    form.append('registerNumber', req.body.registerNumber || '');
    form.append('studentName', req.body.studentName || '');
    form.append('companyName', req.body.companyName || '');

    const response = await axios.post(OCR_URL, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    res.json(response.data);
  } catch (error) {
    console.error('OCR error:', error.message);
    res.status(500).json({
      result: 'error',
      message: 'Unable to verify the document.'
    });
  }
});

app.use((error, _req, res, _next) => {
  console.error(error.message);
  res.status(400).json({ result: 'error', message: error.message });
});

// Only auto-spawn the OCR service as a local child process when OCR_SERVICE_URL
// is NOT set -- i.e. plain local development without Docker. In Docker, the OCR
// service runs in its own container (see ocr_service/Dockerfile + docker-compose.yml),
// and this backend image doesn't even have Python installed, so spawning it here
// would fail and is unnecessary.
let ocrProcess;

if (!process.env.OCR_SERVICE_URL) {
  try {
    ocrProcess = spawn('python', [
      path.join(__dirname, '..', 'ocr_service', 'ocr_service.py')
    ], { stdio: 'inherit' });

    ocrProcess.on('error', (err) => {
      console.error('Unable to start OCR service:', err.message);
    });
  } catch (error) {
    console.error('OCR startup error:', error.message);
  }
}

app.listen(PORT, () => {
  console.log(`InternTrack backend running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  if (ocrProcess) ocrProcess.kill();
  process.exit();
});