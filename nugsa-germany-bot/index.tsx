import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Configuration for the embeddable widget
const WIDGET_ID = 'nugsa-ai-widget-root';

// Function to mount the widget
const mountWidget = () => {
  // Check if the element already exists
  let rootElement = document.getElementById(WIDGET_ID);

  // If not, create it and append to body
  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = WIDGET_ID;
    // Set a high z-index to ensure it sits on top of host site content
    // We also reset some basic styles to prevent host site CSS bleeding in too much
    rootElement.style.zIndex = '2147483647'; // Max z-index
    rootElement.style.position = 'fixed';
    rootElement.style.bottom = '0';
    rootElement.style.right = '0';
    rootElement.style.width = '0';
    rootElement.style.height = '0';
    rootElement.style.pointerEvents = 'none';
    rootElement.style.fontFamily = 'Inter, system-ui, sans-serif';
    document.body.appendChild(rootElement);
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Mount immediately
mountWidget();

// Expose a global object so the host website can control the bot
// Usage: window.NugsaBot.open()
(window as any).NugsaBot = {
  open: () => window.dispatchEvent(new Event('nugsa-bot:open')),
  close: () => window.dispatchEvent(new Event('nugsa-bot:close')),
  toggle: () => window.dispatchEvent(new Event('nugsa-bot:toggle')),
};