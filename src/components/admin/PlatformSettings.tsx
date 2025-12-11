import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Settings, Download, AlertTriangle, Loader2, Bell } from "lucide-react";

interface PlatformSetting {
    maintenance_mode: boolean;
    allow_registrations: boolean;
    email_notifications: boolean;
}

export function PlatformSettings() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<PlatformSetting>({
        maintenance_mode: false,
        allow_registrations: true,
        email_notifications: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [backing, setBacking] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('platform_settings' as any)
                .select('setting_key, setting_value');

            if (error) throw error;

            const settingsObj: any = {};
            (data as any)?.forEach(({ setting_key, setting_value }: any) => {
                settingsObj[setting_key] = setting_value === 'true' || setting_value === true;
            });

            setSettings(settingsObj as PlatformSetting);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast({
                title: "Error",
                description: "Failed to load platform settings",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key: keyof PlatformSetting, value: boolean) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('platform_settings' as any)
                .update({
                    setting_value: value.toString(),
                    updated_by: user?.id,
                    updated_at: new Date().toISOString()
                })
                .eq('setting_key', key);

            if (error) throw error;

            setSettings(prev => ({ ...prev, [key]: value }));
            toast({
                title: "Success",
                description: `${key.replace('_', ' ')} ${value ? 'enabled' : 'disabled'} successfully`,
            });
        } catch (error) {
            console.error('Error updating setting:', error);
            toast({
                title: "Error",
                description: "Failed to update setting",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleBackup = async () => {
        setBacking(true);
        try {
            toast({
                title: "Generating backup...",
                description: "Fetching data from all tables...",
            });

            // Fetch all database tables for a complete backup
            const [
                profiles,
                messages,
                announcements,
                boardMembers,
                platformSettings,
                assistance,
                inquiries,
                adminApprovals,
                constitutionDocs,
                financeSettings,
                heroImages,
                privateMessages,
                orgMilestones,
                orgSettings,
                sponsors
            ] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('community_messages').select('*'),
                supabase.from('announcements').select('*'),
                supabase.from('board_members').select('*'),
                supabase.from('platform_settings' as any).select('*'),
                supabase.from('assistance_requests').select('*'),
                supabase.from('contact_inquiries').select('*'),
                supabase.from('admin_approvals').select('*'),
                supabase.from('constitution_documents').select('*'),
                supabase.from('finance_settings').select('*'),
                supabase.from('hero_images').select('*'),
                supabase.from('messages').select('*'),
                supabase.from('organization_milestones').select('*'),
                supabase.from('organization_settings').select('*'),
                supabase.from('sponsors').select('*')
            ]);

            const backup = {
                timestamp: new Date().toISOString(),
                version: "1.1",
                type: "full_database_backup",
                platform: "NUGSA-Germany",
                data: {
                    profiles: profiles.data || [],
                    community_messages: messages.data || [],
                    announcements: announcements.data || [],
                    board_members: boardMembers.data || [],
                    platform_settings: platformSettings.data || [],
                    assistance_requests: assistance.data || [],
                    contact_inquiries: inquiries.data || [],
                    admin_approvals: adminApprovals.data || [],
                    constitution_documents: constitutionDocs.data || [],
                    finance_settings: financeSettings.data || [],
                    hero_images: heroImages.data || [],
                    messages: privateMessages.data || [],
                    organization_milestones: orgMilestones.data || [],
                    organization_settings: orgSettings.data || [],
                    sponsors: sponsors.data || []
                },
                metadata: {
                    total_records: {
                        profiles: profiles.data?.length || 0,
                        community_messages: messages.data?.length || 0,
                        announcements: announcements.data?.length || 0,
                        board_members: boardMembers.data?.length || 0,
                        assistance_requests: assistance.data?.length || 0,
                        contact_inquiries: inquiries.data?.length || 0,
                        admin_approvals: adminApprovals.data?.length || 0,
                        constitution_documents: constitutionDocs.data?.length || 0,
                        finance_settings: financeSettings.data?.length || 0,
                        hero_images: heroImages.data?.length || 0,
                        messages: privateMessages.data?.length || 0,
                        organization_milestones: orgMilestones.data?.length || 0,
                        organization_settings: orgSettings.data?.length || 0,
                        sponsors: sponsors.data?.length || 0
                    }
                }
            };

            // Create downloadable file
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `nugsa-full-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
                title: "Success",
                description: "Full database backup downloaded successfully",
            });
        } catch (error) {
            console.error('Error generating backup:', error);
            toast({
                title: "Error",
                description: "Failed to generate backup",
                variant: "destructive",
            });
        } finally {
            setBacking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Platform Settings
                    </CardTitle>
                    <CardDescription>
                        Control system-wide platform behavior and features
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Maintenance Mode */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                        <div className="space-y-0.5 flex-1">
                            <Label htmlFor="maintenance-mode" className="text-base font-medium cursor-pointer">
                                Maintenance Mode
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Restrict platform access to admins only during maintenance
                            </p>
                            {settings.maintenance_mode && (
                                <div className="flex items-center gap-2 mt-2 text-amber-600">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-xs font-medium">⚠️ Platform is in maintenance mode</span>
                                </div>
                            )}
                        </div>
                        <Switch
                            id="maintenance-mode"
                            checked={settings.maintenance_mode}
                            onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                            disabled={saving}
                        />
                    </div>

                    {/* Allow Registrations */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                        <div className="space-y-0.5 flex-1">
                            <Label htmlFor="allow-registrations" className="text-base font-medium cursor-pointer">
                                Allow New Registrations
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Enable or disable new user sign-ups on the platform
                            </p>
                        </div>
                        <Switch
                            id="allow-registrations"
                            checked={settings.allow_registrations}
                            onCheckedChange={(checked) => updateSetting('allow_registrations', checked)}
                            disabled={saving}
                        />
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                        <div className="space-y-0.5 flex-1">
                            <Label htmlFor="email-notifications" className="text-base font-medium cursor-pointer">
                                Enable Email Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Send automated email notifications to users for important events
                            </p>
                        </div>
                        <Switch
                            id="email-notifications"
                            checked={settings.email_notifications}
                            onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                            disabled={saving}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Backup Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Download className="w-5 h-5 mr-2" />
                        Full Database Backup
                    </CardTitle>
                    <CardDescription>
                        Export all platform data including profiles, messages, and settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Backup includes all 15 database tables:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <ul className="space-y-1">
                                <li>• User Profiles & Accounts</li>
                                <li>• Community & Private Messages</li>
                                <li>• Announcements & News</li>
                                <li>• Board Members & Executives</li>
                                <li>• Assistance Requests</li>
                                <li>• Contact Inquiries</li>
                                <li>• Admin Approvals</li>
                                <li>• Constitution Documents</li>
                            </ul>
                            <ul className="space-y-1">
                                <li>• Finance Settings</li>
                                <li>• Hero Images</li>
                                <li>• Organization Milestones</li>
                                <li>• Organization Settings</li>
                                <li>• Sponsors</li>
                                <li>• Platform Settings</li>
                            </ul>
                        </div>
                    </div>
                    <Button
                        onClick={handleBackup}
                        className="w-full sm:w-auto"
                        disabled={backing}
                    >
                        {backing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Full Backup...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download Full Backup
                            </>
                        )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Backup will be downloaded as a JSON file. This contains sensitive data, please store it securely.
                    </p>
                </CardContent>
            </Card>

            {/* Push Notifications Test */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Bell className="w-5 h-5 mr-2" />
                        Push Notifications
                    </CardTitle>
                    <CardDescription>
                        Test the push notification system
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-4">
                            Send a test notification to all subscribed users (including yourself).
                        </p>
                        <Button
                            onClick={async () => {
                                try {
                                    toast({
                                        title: "Sending...",
                                        description: "Sending test notification...",
                                    });

                                    const { data, error } = await supabase.functions.invoke('push-notification', {
                                        body: {
                                            title: "Test Notification",
                                            body: "This is a test notification from the admin dashboard.",
                                            url: "/admin-dashboard"
                                        }
                                    });

                                    if (error) throw error;

                                    toast({
                                        title: "Success",
                                        description: `Notification sent! Results: ${JSON.stringify(data)}`,
                                    });
                                } catch (error) {
                                    console.error('Error sending notification:', error);
                                    toast({
                                        title: "Error",
                                        description: "Failed to send notification. Make sure the Edge Function is deployed.",
                                        variant: "destructive",
                                    });
                                }
                            }}
                        >
                            Send Test Notification
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
