let isFirefox = typeof browser !== "undefined";
let _browser = isFirefox ? browser : chrome;
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const siteBtn = document.getElementById('site-btn');
const rateBtn = document.getElementById('rate-btn');
const statusText = document.getElementById('status-text');
const refreshToggle = document.getElementById('refresh-toggle');
const clickerToggle = document.getElementById('clicker-toggle');

loginBtn.addEventListener('click', () => {
  // Add code to handle the Twitch login here
  _browser.tabs.create({ url: 'https://www.twitch-features.click/auth/twitch?returnUrl=' + window.location.href});
  _browser.storage.local.set({ loggedIn: true });
});
logoutBtn.addEventListener('click', () => {
  // Add code to handle the Twitch login here
  _browser.storage.local.set({ loggedIn: false });
  statusText.innerText = ``;
  logoutBtn.style.display = "none";
  loginBtn.style.display = "block";
});
siteBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: "https://www.twitch-features.click/" });
});
rateBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://chrome.google.com/webstore/detail/fyp/id/reviews' });
});
// When the tab is closed and the popup is reopened, retrieve the state from storage
_browser.storage.local.get('loggedIn', function(data) {
  if (data.loggedIn) {
    // Show the logged in UI
    statusText.innerText = `Logged in`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
  } else {
    // Show the logged out UI
    statusText.innerText = ``;
    logoutBtn.style.display = "none";
    loginBtn.style.display = "block";
  }

});
_browser.storage.local.get(['autoRefresh', 'autoClick'], function(result) {
  document.getElementById('refresh-toggle').checked = result.autoRefresh ?? true;
  document.getElementById('clicker-toggle').checked = result.autoClick ?? true;
});
document.getElementById('refresh-toggle').addEventListener('change', function(event) {
  _browser.storage.local.set({ autoRefresh: event.target.checked });
  _browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    _browser.tabs.sendMessage(
      tabs[0].id,
      { action: "toggleAutoRefresh", enabled: event.target.checked }
    );
  });
});
document.getElementById('clicker-toggle').addEventListener('change', function(event) {
  _browser.storage.local.set({ autoClick: event.target.checked });
  _browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    _browser.tabs.sendMessage(
      tabs[0].id,
      { action: "toggleAutoClicker", enabled: event.target.checked }
    );
  });
});