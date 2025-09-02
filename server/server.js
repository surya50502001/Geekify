const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
  console.log('Created uploads directory');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + '-' + file.originalname;
    console.log('Saving file as:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Geekify server is running!',
    uploadedFiles: fs.readdirSync('uploads').length
  });
});

// Upload endpoint
app.post('/upload', upload.single('song'), (req, res) => {
  console.log('\n=== UPLOAD REQUEST ===');
  console.log('Time:', new Date().toISOString());
  
  if (!req.file) {
    console.log('❌ No file received');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  console.log('✅ File received:');
  console.log('  - Original name:', req.file.originalname);
  console.log('  - Saved as:', req.file.filename);
  console.log('  - Size:', req.file.size, 'bytes');
  
  res.json({ 
    success: true, 
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Geekify server running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${path.resolve('uploads')}`);
});