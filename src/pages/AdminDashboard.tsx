import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { VerificationModule } from "@/components/admin/VerificationModule";
import { HeroSlideshowManager } from "@/components/admin/HeroSlideshowManager";
import { PlatformSettings } from "@/components/admin/PlatformSettings";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { ChapterManager } from "@/components/admin/ChapterManager";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { BoardMembersManager } from "@/components/admin/BoardMembersManager";
import { ConstitutionManager } from "@/components/admin/ConstitutionManager";
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";
import { InquiriesManager } from "@/components/admin/InquiriesManager";
import { FinanceManager } from "@/components/admin/FinanceManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, MessageSquare, Building2, UserCheck } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [accessDenied, setAccessDenied] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [managedChapterId, setManagedChapterId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    pendingVerifications: 0,
    totalInquiries: 0,
    pendingInquiries: 0
  });

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        navigate("/auth");
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      checkAdminAccess();
    }
  }, [user, navigate]);

  const checkAdminAccess = async () => {
    if (!user) return;

    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("role, is_verified, managed_chapter_id")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const profile = profileData as any;
      const isGlobalAdmin = profile?.role === "admin" && profile?.is_verified;
      const isChapterLead = !!profile?.managed_chapter_id;

      if (!isGlobalAdmin && !isChapterLead) {
        setAccessDenied(true);
        setUserRole(profile?.role);
        setIsVerified(profile?.is_verified);
        return;
      }

      setUserRole(profile?.role);
      setIsVerified(profile?.is_verified);
      setManagedChapterId(profile?.managed_chapter_id);

      if (isChapterLead && !isGlobalAdmin) {
        setActiveSection("chapters");
      }

      fetchStats();
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast({
        title: "Error",
        description: "Failed to verify admin access",
        variant: "destructive",
      });
    }
  };

  const fetchStats = async () => {
    try {
      const [
        { count: totalStudents },
        { count: verifiedStudents },
        { count: pendingVerifications },
        { count: totalInquiries },
        { count: pendingInquiries }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student").eq("is_verified", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student").eq("is_verified", false),
        supabase.from("contact_inquiries").select("*", { count: "exact", head: true }),
        supabase.from("contact_inquiries").select("*", { count: "exact", head: true }).eq("status", "pending")
      ]);

      setStats({
        totalStudents: totalStudents || 0,
        verifiedStudents: verifiedStudents || 0,
        pendingVerifications: pendingVerifications || 0,
        totalInquiries: totalInquiries || 0,
        pendingInquiries: pendingInquiries || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You do not have permission to access the admin dashboard.
            {userRole && <br />}
            Current Role: <span className="font-semibold">{userRole}</span>
          </p>
          <p className="text-sm text-gray-500">
            Please contact an administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // Shared props
    const commonProps = {
      isGlobalAdmin: userRole === 'admin',
      managedChapterId
    };

    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Registered in the platform</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Students</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.verifiedStudents}</div>
                  <p className="text-xs text-muted-foreground">Successfully verified accounts</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
                  <p className="text-xs text-muted-foreground">Awaiting admin review</p>
                </CardContent>
              </Card>
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Inquiries</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingInquiries}</div>
                  <p className="text-xs text-muted-foreground">Unresolved contact messages</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <HeroSlideshowManager />
            </div>
          </div>
        );
      case 'verification':
        return <VerificationModule />;
      case 'chapters':
        return <ChapterManager />;
      case 'users':
        return (
          // Placeholder for User Management if not implementing full logical component yet
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <p>User management interface goes here.</p>
          </div>
        );
      case 'board':
        return <BoardMembersManager />;
      case 'announcements':
        return <AnnouncementsManager />;
      case 'gallery':
        return <GalleryManager />;
      case 'constitution':
        return <ConstitutionManager />;
      case 'inquiries':
        return <InquiriesManager />;
      case 'finance':
        return <FinanceManager />;
      case 'settings':
        return (
          <div className="space-y-6">
            <PlatformSettings />
          </div>
        );
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-gray-50">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userRole={userRole}
        isChapterLead={!!managedChapterId}
      />

      <main className="flex-1 p-8 w-full min-w-0 relative z-10 pointer-events-auto isolate">
        <div className="max-w-7xl mx-auto space-y-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}