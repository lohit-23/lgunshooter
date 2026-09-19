const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// In-memory leaderboards / high scores
const scores = [
  { name: 'CyberSniper', score: 1540, weapon: 'Cyber Laser', date: new Date().toISOString() },
  { name: 'NeonGunner', score: 1280, weapon: 'Plasma Bolt', date: new Date().toISOString() },
  { name: 'PulseRider', score: 950, weapon: 'Inferno Fire', date: new Date().toISOString() }
];

// Health check endpoint for Render monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'hand-shooter-gun-server'
  });
});

// API route to get scores
app.get('/api/scores', (req, res) => {
  const sorted = [...scores].sort((a, b) => b.score - a.score).slice(0, 10);
  res.json({ success: true, scores: sorted });
});

// API route to submit score
app.post('/api/scores', (req, res) => {
  const { name, score, weapon } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ success: false, error: 'Invalid score payload' });
  }

  const newEntry = {
    name: String(name).slice(0, 16),
    score: Math.max(0, Math.floor(score)),
    weapon: weapon || 'Cyber Laser',
    date: new Date().toISOString()
  };

  scores.push(newEntry);
  res.json({ success: true, entry: newEntry });
});

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===========================================`);
  console.log(`⚡ Hand Shooter Gun Server is RUNNING!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Frontend root: ${frontendPath}`);
  console.log(`===========================================`);
});
