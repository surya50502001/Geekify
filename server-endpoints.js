// Add these endpoints to your backend server

// GET /songs - List all uploaded songs
app.get('/songs', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ success: true, songs: [] });
    }
    
    const files = fs.readdirSync(uploadsDir);
    const songs = files
      .filter(file => file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.m4a'))
      .map(file => {
        const stats = fs.statSync(path.join(uploadsDir, file));
        return {
          filename: file,
          name: file,
          uploader: 'User', // You can enhance this to track actual uploader
          uploadDate: stats.birthtime
        };
      });
    
    res.json({ success: true, songs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /play/:filename - Stream audio file
app.get('/play/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Update your existing upload endpoint to track uploader
app.post('/upload', upload.single('song'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  
  const uploader = req.body.uploader || 'Anonymous';
  
  // You can store uploader info in a database or file
  // For now, just log it
  console.log(`Song uploaded by: ${uploader}`);
  
  res.json({ 
    success: true, 
    originalName: req.file.originalname,
    filename: req.file.filename,
    uploader: uploader
  });
});