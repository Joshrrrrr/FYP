# README

## Extension(./extension)

- `extension`: A folder containing the code for a browser extension.

To use the browser extension, follow these steps:

1. Clone the repository to your local machine.
2. Open your browser and go to the extensions page.
3. Enable Developer mode.
4. Click on the "Load unpacked" button.
5. Select the `/extension` folder from your cloned repository.

## Webpage

- `public`: A folder containing files that will be publicly accessible on the web server.
- `views`: A folder containing HTML templates for the web server.
- `.gitignore`: A file specifying which files should be ignored by Git.
- `content.js`: A JavaScript file containing the content script for the browser extension.
- `package-lock.json`: A JSON file specifying the exact version of each package installed in the project.
- `package.json`: A JSON file specifying the project's dependencies and other metadata.
- `server.js`: A JavaScript file containing the code for the web server.

To run the web server, follow these steps:

1. Install Node.js if it is not already installed on your machine.
2. Open a terminal or command prompt and navigate to the directory where the repository is cloned.
3. Run the command `npm install` to install the project's dependencies.
4. Run the command `node server.js` to start the web server.
5. Open your web browser and go to `http://localhost:3000` to view the web page.
