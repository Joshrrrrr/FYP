const webpageBtn = document.getElementById('button-webpage');
const extensionBtn = document.getElementById('button-extension');
const webpageInfo = document.getElementById('webpage-info');
const extensionInfo = document.getElementById('extension-info');

extensionBtn.classList.add('active-button');

webpageBtn.addEventListener('click', () => {
  webpageBtn.classList.add('active-button');
  extensionBtn.classList.remove('active-button');
  webpageInfo.style.display = 'block';
  extensionInfo.style.display = 'none';
});

extensionBtn.addEventListener('click', () => {
  extensionBtn.classList.add('active-button');
  webpageBtn.classList.remove('active-button');
  extensionInfo.style.display = 'block';
  webpageInfo.style.display = 'none';
});
function copyToClipboard() {
    // Get the text inside the code block
    const codeBlock = document.querySelector('pre code');
    const codeText = codeBlock.innerText;

    // Create a temporary input element to copy the text to the clipboard
    const input = document.createElement('input');
    input.setAttribute('value', codeText);
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);

    // Show a message to the user
    alert('Code copied to clipboard!');
  }