const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Create songs directory if it doesn't exist
const songsDir = path.join(__dirname, 'spotify.client', 'public', 'songs');
if (!fs.existsSync(songsDir)) {
  fs.mkdirSync(songsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, songsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Store upload metadata (in production, use a database)
let uploadedSongs = [];

// Upload endpoint with AMR to MP3 conversion
app.post('/upload', upload.single('song'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  
  const uploader = req.body.uploader || 'Anonymous';
  const inputPath = req.file.path;
  const isAMR = req.file.originalname.toLowerCase().includes('amr') || req.file.mimetype === 'audio/amr';
  
  if (isAMR) {
    // Convert AMR to MP3
    const mp3Filename = req.file.filename.replace(/\.[^/.]+$/, '') + '.mp3';
    const outputPath = path.join(songsDir, mp3Filename);
    
    exec(`ffmpeg -i "${inputPath}" -ar 44100 -ac 2 -b:a 128k "${outputPath}"`, (error) => {
      if (error) {
        console.error('Conversion error:', error);
        // Keep original file if conversion fails
        const songData = {
          filename: req.file.filename,
          name: req.file.originalname,
          uploader: uploader,
          uploadDate: new Date()
        };
        uploadedSongs.push(songData);
        return res.json({ 
          success: true, 
          originalName: req.file.originalname,
          filename: req.file.filename,
          uploader: uploader,
          converted: false
        });
      }
      
      // Delete original AMR file and use MP3
      fs.unlinkSync(inputPath);
      const songData = {
        filename: mp3Filename,
        name: req.file.originalname.replace(/\.[^/.]+$/, '') + '.mp3',
        uploader: uploader,
        uploadDate: new Date()
      };
      uploadedSongs.push(songData);
      console.log(`AMR converted to MP3: ${req.file.originalname} -> ${mp3Filename}`);
      
      res.json({ 
        success: true, 
        originalName: req.file.originalname,
        filename: mp3Filename,
        uploader: uploader,
        converted: true
      });
    });
  } else {
    // Non-AMR files, process normally
    const songData = {
      filename: req.file.filename,
      name: req.file.originalname,
      uploader: uploader,
      uploadDate: new Date()
    };
    uploadedSongs.push(songData);
    console.log(`Song uploaded: ${req.file.originalname} by ${uploader}`);
    
    res.json({ 
      success: true, 
      originalName: req.file.originalname,
      filename: req.file.filename,
      uploader: uploader,
      converted: false
    });
  }
});

// Get all uploaded songs
app.get('/songs', (req, res) => {
  console.log('Songs requested, returning:', uploadedSongs.length, 'songs');
  res.json({ success: true, songs: uploadedSongs });
});

// Stream audio files
app.get('/play/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(songsDir, filename);
  
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

// Delete file endpoint (admin only)
app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(songsDir, filename);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      uploadedSongs = uploadedSongs.filter(song => song.filename !== filename);
      console.log(`File deleted: ${filename}`);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete file' });
  }
});

// Push approved song to GitHub
app.post('/push-to-github', async (req, res) => {
  const { filename, title } = req.body;
  const filePath = path.join(songsDir, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }
  
  try {
    // Read file as base64
    const fileContent = fs.readFileSync(filePath, { encoding: 'base64' });
    
    // GitHub API call (you'll need to add your token)
    const githubToken = 'YOUR_GITHUB_TOKEN'; // Replace with your token
    const repo = 'surya50502001/Spotify-';
    const githubPath = filename;
    
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${githubPath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Add approved song: ${title}`,
        content: fileContent,
        branch: 'main'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`Song pushed to GitHub: ${title}`);
      res.json({ 
        success: true, 
        githubUrl: result.content.download_url,
        message: 'Song pushed to GitHub successfully' 
      });
    } else {
      console.error('GitHub API error:', result);
      res.status(500).json({ success: false, error: 'GitHub push failed' });
    }
  } catch (error) {
    console.error('GitHub push error:', error);
    res.status(500).json({ success: false, error: 'Failed to push to GitHub' });
  }
});

// Health check endpoint
app.get('/status', (req, res) => {
  res.json({ success: true, status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Songs will be saved to:', songsDir);
});