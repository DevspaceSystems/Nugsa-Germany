import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function NotificationManager() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);

    useEffect(() => {
        checkSubscription();
    }, []);

    const checkSubscription = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
        setPermission(Notification.permission);
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribe = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            // Request permission
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm !== 'granted') {
                toast({
                    title: "Permission denied",
                    description: "Please enable notifications in your browser settings to receive updates.",
                    variant: "destructive"
                });
                return;
            }

            const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                console.error("VITE_VAPID_PUBLIC_KEY is missing");
                toast({
                    title: "Configuration Error",
                    description: "Push notifications are not configured correctly.",
                    variant: "destructive"
                });
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });

            // Save to database
            const { error } = await supabase.from('push_subscriptions' as any).insert({
                endpoint: subscription.endpoint,
                p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')!))),
                auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')!)))
            });

            if (error) {
                // If duplicate (already subscribed), just ignore
                if (error.code !== '23505') throw error;
            }

            setIsSubscribed(true);
            toast({
                title: "Subscribed!",
                description: "You will now receive notifications for important updates.",
            });

        } catch (error) {
            console.error('Error subscribing:', error);
            toast({
                title: "Error",
                description: "Failed to subscribe to notifications.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Unsubscribe from browser
                await subscription.unsubscribe();

                // Remove from database
                await supabase.from('push_subscriptions' as any).delete().eq('endpoint', subscription.endpoint);

                setIsSubscribed(false);
                toast({
                    title: "Unsubscribed",
                    description: "You will no longer receive notifications.",
                });
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
            toast({
                title: "Error",
                description: "Failed to unsubscribe.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (permission === 'denied') {
        return (
            <Button variant="ghost" size="icon" disabled title="Notifications blocked">
                <BellOff className="h-5 w-5 text-muted-foreground" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={loading}
            title={isSubscribed ? "Disable notifications" : "Enable notifications"}
        >
            {isSubscribed ? (
                <Bell className="h-5 w-5 text-primary fill-primary" />
            ) : (
                <Bell className="h-5 w-5" />
            )}
        </Button>
    );
}
