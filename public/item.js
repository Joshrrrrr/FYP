const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', () => {
  console.log(window.location.href)
  window.location.href = 'https://www.twitch-features.click/auth/twitch?returnUrl=' + window.location.href;
});
const burgerMenu = document.querySelector('.burger-menu');
const menuOptions = document.querySelector('.menu-options');
const head = document.querySelector('.head');
const h1Tags = document.querySelectorAll('h1');
const h4text1 = document.getElementById('h4text1');
const h4text2 = document.getElementById('h4text2');

burgerMenu.addEventListener('click', function() {
  menuOptions.classList.toggle('active');
});
const darkModeToggle = document.getElementById('dark-mode-toggle');

darkModeToggle.addEventListener('click', function() {
  // toggle dark mode styles
  document.body.classList.toggle('dark-mode');
  head.classList.toggle('dark-mode');
  h1Tags.forEach((h1) => {
    h1.classList.toggle('dark-mode');
  });
  h4text1.classList.toggle('dark-mode');
  h4text2.classList.toggle('dark-mode');
});
function goBack() {
  window.history.back();
}