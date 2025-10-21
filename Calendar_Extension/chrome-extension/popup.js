// This runs in the Chrome extension popup
// It communicates with your backend server

const SERVER_URL = 'http://localhost:3000'; // Your backend server

document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.createElement('div');
  statusDiv.id = 'status';
  document.body.appendChild(statusDiv);

  // Check if user is authenticated
  checkAuthStatus();
});

async function checkAuthStatus() {
  const statusDiv = document.getElementById('status');
  
  try {
    // Check if tokens exist on the server
    const response = await fetch(`${SERVER_URL}/auth-status`);
    const data = await response.json();
    
    if (data.authenticated) {
      statusDiv.innerHTML = '<p>✓ Authenticated</p>';
      loadCalendarEvents();
    } else {
      statusDiv.innerHTML = '<p>Not authenticated. <button id="loginBtn">Login with Google</button></p>';
      document.getElementById('loginBtn').addEventListener('click', login);
    }
  } catch (error) {
    statusDiv.innerHTML = '<p>Error: Cannot connect to server. Make sure your backend is running on port 3000.</p>';
    console.error('Connection error:', error);
  }
}

function login() {
  // Open the OAuth flow in a new tab
  chrome.tabs.create({ url: `${SERVER_URL}/` });
}

async function loadCalendarEvents() {
  const statusDiv = document.getElementById('status');
  
  try {
    const response = await fetch(`${SERVER_URL}/test-canvas`);
    const events = await response.json();
    
    statusDiv.innerHTML += '<h2>Calendar Events:</h2>';
    if (events && events.length > 0) {
      const eventsList = document.createElement('ul');
      events.forEach(event => {
        const li = document.createElement('li');
        li.textContent = event.summary || 'No title';
        eventsList.appendChild(li);
      });
      statusDiv.appendChild(eventsList);
    } else {
      statusDiv.innerHTML += '<p>No events found.</p>';
    }
  } catch (error) {
    statusDiv.innerHTML += '<p>Error loading events: ' + error.message + '</p>';
  }
}