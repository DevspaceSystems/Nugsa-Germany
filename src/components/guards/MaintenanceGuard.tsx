import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            await Promise.all([checkMaintenanceMode(), checkUserRole()]);
            setLoading(false);
        };
        checkStatus();
    }, [user]);

    const checkMaintenanceMode = async () => {
        try {
            const { data, error } = await supabase
                .from('platform_settings')
                .select('setting_value')
                .eq('setting_key', 'maintenance_mode')
                .single();

            if (error) {
                // If table doesn't exist or error, assume not in maintenance
                console.error("Error checking maintenance mode:", error);
                return;
            }

            setIsMaintenanceMode(data?.setting_value === true || data?.setting_value === 'true');
        } catch (e) {
            console.error("Failed to check maintenance mode", e);
        }
    };

    const checkUserRole = async () => {
        if (!user) {
            setIsAdmin(false);
            return;
        }

        try {
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            setIsAdmin(data?.role === 'admin');
        } catch (e) {
            console.error("Failed to check user role", e);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isMaintenanceMode && !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
                <Card className="max-w-md w-full shadow-lg border-amber-200">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-amber-100 p-3 rounded-full w-fit mb-4">
                            <AlertTriangle className="w-8 h-8 text-amber-600" />
                        </div>
                        <CardTitle className="text-2xl text-amber-800">Under Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-muted-foreground">
                            The NUGSA-Germany Platform is currently undergoing scheduled maintenance to improve your experience.
                        </p>
                        <div className="bg-white/50 p-4 rounded-lg border border-amber-100 text-sm text-amber-900">
                            <p className="font-medium">We'll be back shortly!</p>
                            <p>Thank you for your patience.</p>
                        </div>
                        {user && (
                            <p className="text-xs text-muted-foreground mt-4">
                                Logged in as: {user.email}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
