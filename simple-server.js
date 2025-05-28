const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// Mime types for serving different file types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Handle file requests
  let filePath = '.' + decodeURIComponent(req.url);
  if (filePath === './') {
    filePath = './index.html';
  } else if (filePath === './admin') {
    filePath = './admin/simple-admin.html';
  }
  console.log(`Decoded file path: ${filePath}`);
  
  // Get file extension
  const extname = path.extname(filePath);
  let contentType = mimeTypes[extname] || 'text/plain';
  
  // Special handling for binary files like images
  const isBinary = ['.png', '.jpg', '.jpeg', '.gif'].includes(extname);
  
  // Read file
  fs.readFile(filePath, isBinary ? null : 'utf-8', (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        console.log(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('File not found');
      } else {
        // Server error
        console.error(`Server error: ${err.code} for ${filePath}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success - return file content
      console.log(`Successfully serving: ${filePath} as ${contentType}`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Admin login page: http://localhost:${PORT}/admin/simple-admin.html`);
});
