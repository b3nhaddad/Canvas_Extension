require('dotenv').config();
const express = require('express');
const {google} = require('googleapis');
const fs = require('fs');
const cors = require('cors'); // You'll need to install this: npm install cors
const app = express();
const calendarReader = require('./utils/calendarReader.js');

// Enable CORS so your Chrome extension can communicate with this server
app.use(cors());

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID, 
  process.env.SECRET_ID, 
  process.env.REDIRECT
);

// Check if user is authenticated
app.get('/auth-status', (req, res) => {
  try {
    if (fs.existsSync('tokens.json')) {
      const tokens = JSON.parse(fs.readFileSync('tokens.json'));
      oauth2Client.setCredentials(tokens);
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  } catch (error) {
    res.json({ authenticated: false });
  }
});

// User login prompt
app.get('/', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar']
  });
  res.redirect(url);
});

// OAuth redirect callback
app.get('/redirect', (req, res) => {
  const code = req.query.code;
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) {
      console.error('Error retrieving token:', err);
      res.send('Error during authentication');
      return;
    }
    oauth2Client.setCredentials(tokens);
    fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
    res.send('Authentication successful! You can close this window and return to the extension.');
  });
});

// Get Canvas events
app.get('/test-canvas', async (req, res) => { 
  try {
    // Load tokens if they exist
    if (fs.existsSync('tokens.json')) {
      const tokens = JSON.parse(fs.readFileSync('tokens.json'));
      oauth2Client.setCredentials(tokens);
    }
    
    const events = await calendarReader.getCanvasEvents();
    res.json(events);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
console.log('Canvas Token:', process.env.CANVAS_TOKEN);