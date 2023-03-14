const loginButton = document.getElementById('loginButton');
console.log('button found');
loginButton.addEventListener('click', () => {
  console.log(window.location.href)
  window.location.href = 'http://localhost:3000/auth/twitch?returnUrl=' + window.location.href;
});
const burgerMenu = document.querySelector('.burger-menu');
const menuOptions = document.querySelector('.menu-options');
const head = document.querySelector('.head');
const h1Tags = document.querySelectorAll('h1');
const h4text1 = document.getElementById('h4text1');
const h4text2 = document.getElementById('h4text2');
const sliceItems = document.querySelectorAll('.slice');
const searchTypeCheckboxes = document.querySelectorAll('input[name="searchType"]');
const form = document.getElementById("myForm");

searchTypeCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('click', () => {
    // create or update hidden input field with checkbox value
    let input = document.getElementById("hidden_" + checkbox.id);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.id = "hidden_" + checkbox.id;
      input.name = checkbox.name;
      console.log(input)
      form.appendChild(input);
    }
    if (checkbox.checked) {
      input.value = checkbox.value;
    } else {
      input.value = "";
    }
    // Uncheck all other checkboxes
    searchTypeCheckboxes.forEach(otherCheckbox => {
      if (otherCheckbox !== checkbox) {
        otherCheckbox.checked = false;
      }
    });
    searchTypeInput = checkbox.value;
  });
});

form.addEventListener("submit", () => {
  // remove hidden input fields for unchecked checkboxes
  searchTypeCheckboxes.forEach((checkbox) => {
    if (!checkbox.checked) {
      let input = document.getElementById("hidden_" + checkbox.id);
      if (input) {
        input.remove();
      }
    }
  });
});

sliceItems.forEach(item => {
  item.textContent = item.textContent.slice(0, 750) + '...';
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
