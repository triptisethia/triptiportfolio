# Tripti Portfolio

The complete static website is in `dist`: HTML text, styles, JavaScript interactions and generated sounds, images, fonts, PDFs, audio/video assets, and embedded external links.

## Upload to GitHub
Create an empty repository. Upload the contents of this folder, keeping the `dist` folder and its subfolders intact. Do not upload the folder as a ZIP.

## Host on Vercel
Import the GitHub repository. Select Other as the framework. Leave the build command empty and use `dist` as the output directory. Deploy. The included vercel.json sets the output directory.

## Preview locally
With Node.js installed, run `npm start`, then open http://127.0.0.1:4173.

## Editing
Edit the files inside `dist` directly. No build step or dependencies are required.

External embeds remain links to their original services and require those services to remain available. Visitor sticky notes are stored in each visitor's browser, not a shared database.
