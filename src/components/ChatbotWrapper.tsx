import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function ChatbotWrapper() {
    const location = useLocation();
    const previousPath = useRef(location.pathname);

    useEffect(() => {
        const currentPath = location.pathname;
        const isAdminOrDashboard = currentPath.includes('/admin') || currentPath.includes('/dashboard');
        const wasOnHomepage = previousPath.current === '/';

        // If navigating from homepage to admin/dashboard, refresh the page
        if (wasOnHomepage && isAdminOrDashboard) {
            window.location.reload();
            return;
        }

        // Only load chatbot on homepage
        if (currentPath === '/') {
            const existingScript = document.querySelector('script[src="/bot/index.js"]');

            if (!existingScript) {
                const script = document.createElement('script');
                script.type = 'module';
                script.src = '/bot/index.js';
                script.id = 'nugsa-chatbot-script';
                document.body.appendChild(script);
            }
        }

        previousPath.current = currentPath;
    }, [location.pathname]);

    return null;
}
