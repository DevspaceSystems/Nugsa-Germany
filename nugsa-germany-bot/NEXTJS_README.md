# Next.js Integration Guide

To add the NUGSA-Germany RAG Chatbot to your Next.js application, follow these steps.

## 1. Copy Files
Copy the following folders and files from this project into your Next.js project's `src` folder (or root if not using `src`):

*   `components/` (specifically `NugsaWidget.tsx` and `ChatInterface.tsx`)
*   `services/` (`geminiService.ts`)
*   `data/` (`initialContext.ts`)
*   `types.ts`

## 2. Install Dependencies
Ensure your Next.js project has the required packages installed:

```bash
npm install @google/genai lucide-react react-markdown
# or
yarn add @google/genai lucide-react react-markdown
```

## 3. Configure API Key
In Next.js, `process.env` variables are only available on the server by default. Since the chatbot runs in the browser, you must explicitly expose the `API_KEY`.

Open `next.config.mjs` (or `next.config.js`) and add the `env` block:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // This injects the variable so it's accessible via process.env.API_KEY in the browser
    API_KEY: process.env.API_KEY, 
  },
};

export default nextConfig;
```

**Security Note:** This exposes your API key to the client. In a production environment, it is recommended to use Next.js API Routes (`/api/chat`) to proxy requests to Gemini, but this setup matches the provided standalone code.

## 4. Import the Widget
Import the `<NugsaWidget />` component in your root layout file so it appears on every page.

**For App Router (`app/layout.tsx`):**
```tsx
import NugsaWidget from '@/components/NugsaWidget'; // Adjust path as needed

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <NugsaWidget />
      </body>
    </html>
  );
}
```

**For Pages Router (`pages/_app.tsx`):**
```tsx
import type { AppProps } from 'next/app';
import NugsaWidget from '@/components/NugsaWidget';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <NugsaWidget />
    </>
  );
}
```

## 5. Controlling the Bot (Optional)
You can trigger the bot from anywhere in your app using the global window object (ensure you wrap this in a client-side check):

```tsx
<button onClick={() => window.dispatchEvent(new Event('nugsa-bot:open'))}>
  Open Chat
</button>
```
