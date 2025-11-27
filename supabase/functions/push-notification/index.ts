import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webpush from "https://esm.sh/web-push@3.6.3";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { title, body, icon, url } = await req.json();

        // Initialize Supabase Client
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Fetch all subscriptions
        const { data: subscriptions, error } = await supabaseClient
            .from("push_subscriptions")
            .select("*");

        if (error) throw error;

        // Configure Web Push
        const vapidEmail = Deno.env.get("VAPID_EMAIL") || "admin@example.com";
        const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
        const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

        if (!vapidPublicKey || !vapidPrivateKey) {
            throw new Error("VAPID keys are not set in Edge Function secrets");
        }

        webpush.setVapidDetails(
            `mailto:${vapidEmail}`,
            vapidPublicKey,
            vapidPrivateKey
        );

        const payload = JSON.stringify({
            title,
            body,
            icon,
            url,
        });

        const results = [];

        // Send notifications
        for (const sub of subscriptions) {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            try {
                await webpush.sendNotification(pushSubscription, payload);
                results.push({ status: "fulfilled", id: sub.id });
            } catch (err) {
                console.error("Error sending notification to", sub.id, err);

                // If subscription is invalid (410 Gone), delete it
                if (err.statusCode === 410) {
                    await supabaseClient
                        .from("push_subscriptions")
                        .delete()
                        .eq("id", sub.id);
                }

                results.push({ status: "rejected", id: sub.id, error: err });
            }
        }

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
