import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function ChatbotWrapper() {
    const location = useLocation();
    const previousPath = useRef(location.pathname);

    useEffect(() => {
        const currentPath = location.pathname;

        if (currentPath === '/') {
            // Only load chatbot on homepage
            const existingScript = document.getElementById('nugsa-chatbot-script');

            if (!existingScript) {
                const script = document.createElement('script');
                script.type = 'module';
                script.src = '/bot/index.js';
                script.id = 'nugsa-chatbot-script';
                document.body.appendChild(script);
            } else {
                // If script exists but container was removed, we might need a way to re-init 
                // but usually, we just want to show/hide.
                // However, the bot script might have already run.
                // Let's ensure the container is visible if it exists
                const container = document.getElementById('nugsa-ai-widget-root');
                if (container) {
                    container.style.display = 'block';
                }
            }
        } else {
            // Remove chatbot if not on homepage
            const container = document.getElementById('nugsa-ai-widget-root');
            if (container) {
                // Instead of completely removing (which might break the script if it re-loads)
                // we hide it to be safe, or we can try removing it.
                // The user said "restrict to only the home page", so hiding is usually enough and safer.
                container.style.display = 'none';
            }

            // We could also remove the script, but that might cause issues if navigating back to home.
            // Keeping the script but hiding the UI is the standard "SPA" way.
        }
    }, [location.pathname]);

    return null;
}
