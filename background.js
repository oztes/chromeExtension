// background.js
const clientId = 'YOUR_CLIENT_ID';
const redirectUri = chrome.identity.getRedirectURL();
const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=https://www.googleapis.com/auth/calendar`;

let accessToken = null;

// Listen for messages from the content script/popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'authenticate') {
    authenticate(sendResponse);
    return true; // To indicate that we will send a response asynchronously
  } else if (request.action === 'createEvent') {
    createEvent(request.calendarId, request.event, sendResponse);
    return true;
  }
});

function authenticate(callback) {
  if (accessToken) {
    callback(true);
    return;
  }

  chrome.identity.launchWebAuthFlow({url: authUrl, interactive: true}, function(responseUrl) {
    if (responseUrl) {
      let queryString = responseUrl.substring(responseUrl.indexOf('#') + 1);
      let params = new URLSearchParams(queryString);
      accessToken = params.get('access_token');
      callback(true);
    } else {
      callback(false);
    }
  });
}

function createEvent(calendarId, event, callback) {
  if (!accessToken) {
    callback({success: false, message: 'Not authenticated'});
    return;
  }

  let xhr = new XMLHttpRequest();
  xhr.open('POST', `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    if (xhr.status == 200) {
      callback({success: true, event: JSON.parse(xhr.responseText)});
    } else {
      // In production, handle different error statuses gracefully
      callback({success: false, message: xhr.responseText});
    }
  };
  xhr.send(JSON.stringify(event));
}
