const loginButton = document.getElementById('loginButton');
const burgerMenu = document.querySelector('.burger-menu');
const menuOptions = document.querySelector('.menu-options');
const head = document.querySelector('.head');
const h1Tags = document.querySelectorAll('h1');
const h4text1 = document.getElementById('h4text1');
const h4text2 = document.getElementById('h4text2');
const sliceItems = document.querySelectorAll('.slice');
const searchTypeCheckboxes = document.querySelectorAll('input[name="searchType"]');
const form = document.getElementById("myForm");
const submitBtn = document.querySelector('.search-icon-btn');
const matchWholeWordCheckbox =  document.getElementById("match-whole-word");
const suggestBtn = document.querySelector('.suggest-btn');
const suggestBtn2 = document.getElementById('submit-btn');
const modal = document.getElementById('modal');
const closeButton = document.getElementById('close-btn');
const body = document.querySelector('body');
const inputField = document.getElementById('input-field');
const profileButton = document.getElementById('profileButton');
let emoteSuggest = [];
function handleInputChange() {
  if (inputField.value === '') {
    suggestBtn2.disabled = true;
  } else {
    suggestBtn2.disabled = false;
  }
}

if (loginButton) {
  loginButton.addEventListener('click', () => {
    window.location.href = 'https://www.twitch-features.click/auth/twitch?returnUrl=' + window.location.href;
  });
}
// check if profile button exists
if (profileButton) {
  // create sign out option
  const signOutOption = document.createElement('a');
  signOutOption.classList.add('dropdown-item');
  signOutOption.href = '/logout';
  signOutOption.textContent = 'Sign Out';

  // add sign out option to burger menu
  menuOptions.appendChild(signOutOption);
}

inputField.addEventListener('input', handleInputChange);

submitBtn.addEventListener('click', validateForm);

suggestBtn.addEventListener('click', function() {
  if (document.cookie.includes('connect.sid')) {
    // If the cookie does not exist, ask to the login
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    modal.classList.add('show-modal');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);
  } else {
    // If the cookie exists, render the new suggestion form
    //alert('Please login with Twitch')
    modal.classList.add('show-modal');
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);
  }
});
// Submit form when 'Suggest' button is clicked
document.getElementById('suggest-form').addEventListener('submit', (e) => {
  e.preventDefault();
  // Handle form submission here
  alert('Submission '+inputField.value+' logged');
  emoteSuggest.push(inputField.value);
  modal.classList.remove('show-modal');
  document.getElementById('overlay').remove();
});
if(closeButton){
  closeButton.addEventListener('click', () => {
    modal.classList.remove('show-modal');
    document.getElementById('overlay').remove();
  });
}
function validateForm(event) {
  let isChecked = false;
  searchTypeCheckboxes.forEach(function(checkbox) {
    if (checkbox.checked) {
      isChecked = true;
    }
  });
  if (!isChecked) {
    event.preventDefault(); // prevent form submission
    alert('Please select at least one search type.');
  }
}
matchWholeWordCheckbox.addEventListener('click', (event) => {
  // handle the click event here
  let hiddenInput = form.querySelector('input[name="match_whole_word"]');
  if (!hiddenInput) {
    hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'wholeWord');
    form.appendChild(hiddenInput);
  }
  // Set the value of the hidden input field to the checkbox value
  hiddenInput.value = matchWholeWordCheckbox.checked ? 'match' : '0';
});

searchTypeCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('click', () => {
    // create or update hidden input field with checkbox value
    let input = document.getElementById("hidden_" + checkbox.id);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.id = "hidden_" + checkbox.id;
      input.name = checkbox.name;
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
