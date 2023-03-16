const loginButton = document.getElementById('loginButton');
const burgerMenu = document.querySelector('.burger-menu');
const menuOptions = document.querySelector('.menu-options');
const head = document.querySelector('.head');
const h1Tags = document.querySelectorAll('h1');
const h4text1 = document.getElementById('h4text1');
const h4text2 = document.getElementById('h4text2');
const dropdownBtn = document.querySelector('.dropbtn');
const dropdownContent = document.querySelector('.dropdown-content');
const itemsContainer = document.querySelectorAll('.items-container');
const fltDropdownBtn = document.querySelector('.filter-button');
const fltDropdownContent = document.querySelector('.filter-dropdown-content');
const searchTypeCheckboxes = document.querySelectorAll('input[name="searchType"]');
const matchWholeWordCheckbox = document.querySelectorAll('input[name="wholeWord"]');

let searchTypeInput= 'searchTerm';

if (loginButton) {
  loginButton.addEventListener('click', () => {
    window.location.href = 'https://www.twitch-features.click/auth/twitch?returnUrl=' + window.location.href;
  });
}
// check if profile button exists
const profileButton = document.getElementById('profileButton');
if (profileButton) {
  // create sign out option
  const signOutOption = document.createElement('a');
  signOutOption.classList.add('dropdown-item');
  signOutOption.href = '/logout';
  signOutOption.textContent = 'Sign Out';

  // add sign out option to burger menu
  menuOptions.appendChild(signOutOption);
}

// Add click event listener to each checkbox
searchTypeCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('click', () => {
    // Uncheck all other checkboxes
    searchTypeCheckboxes.forEach(otherCheckbox => {
      if (otherCheckbox !== checkbox) {
        otherCheckbox.checked = false;
      }
    });
    searchTypeInput = checkbox.value;
  });
});

//max 5 items in a container
itemsContainer.forEach(container => {
  // code to execute for each item container
  const items = container.querySelectorAll('.list_item');
  for (let i = 5; i < items.length; i++) {
    items[i].style.display = 'none';
  }
});
// Add click event listener to filter dropdown button
fltDropdownBtn.addEventListener('click', function() {
  // Toggle the 'show' class on the dropdown content
  fltDropdownContent.classList.toggle('show');
});
// Add click event listener to dropdown button
dropdownBtn.addEventListener('click', function() {
  // Toggle the 'show' class on the dropdown content
  dropdownContent.classList.toggle('show');
});
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
