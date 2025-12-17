# How to Add the NUGSA Bot to Your Website

To add this chatbot to your existing website (WordPress, Wix, HTML, PHP, etc.), follow these steps:

## Step 1: Build the Project
Since this is a React application, it needs to be "compiled" into standard JavaScript files that browsers can understand.

1.  Open your terminal in this project folder.
2.  Run the build command:
    ```bash
    npm run build
    ```
    *(If you don't have a build script set up yet, typically you would use Vite or Create React App).*

3.  This will create a `dist` or `build` folder containing:
    *   `assets/index.js` (The main logic)
    *   `assets/index.css` (The styles)

## Step 2: Upload Files
Upload the generated `.js` and `.css` files to your website's server (e.g., in a `/js` or `/assets` folder).

## Step 3: Add the Code Snippet
Copy and paste the following code into your website's HTML, preferably just before the closing `</body>` tag.

```html
<!-- NUGSA Bot Styles -->
<link rel="stylesheet" href="/path/to/your/index.css">

<!-- NUGSA Bot Script -->
<script type="module" src="/path/to/your/index.js"></script>

<!-- Optional: Control the bot with your own buttons -->
<script>
  // You can open the bot from anywhere on your site
  function openNugsaBot() {
    if (window.NugsaBot) {
      window.NugsaBot.open();
    }
  }
</script>
```

## Step 4: Add Custom Triggers (Optional)
If you want a "Contact Support" button on your existing menu to open the bot, simply add this to your link:

```html
<a href="#" onclick="window.NugsaBot.open(); return false;">Ask AI Support</a>
```

## Troubleshooting
*   **CSS Conflicts**: The bot is designed to be isolated, but if your website's styles affect the bot, check the `z-index` in `index.tsx`.
*   **Not showing up**: Ensure the path to the `.js` file is correct in your script tag.
