# T&C Red Flag Detector - Website

This is the React web application companion to the Chrome Extension.

## ⚠️ Important: Folder Name Warning
Your project is currently in a folder named `T&C`. The special character `&` (ampersand) often breaks web development tools like Vite and npm on Windows.
**Please rename your folder to `TermsandConditions` or `TnC` or similar (no special characters).**

## How to Run
1. Open a terminal in this directory (`website`).
2. Run `npm install` (if you haven't already).
3. Run `npm run dev`.
4. Open the `localhost` URL shown in the terminal (usually `http://localhost:5173`).

## Why is the page blank?
If you simply double-click `index.html`, it will be blank. This is normal for modern React applications. They must be served by a web server (like `npm run dev`) to work correctly due to browser security restrictions on loading scripts from the file system.
