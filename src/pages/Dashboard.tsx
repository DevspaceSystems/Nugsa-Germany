import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MessageSquare, 
  Bell, 
  Heart,
  PlusCircle,
  Calendar,
  BookOpen,
  TrendingUp
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Announcement = Tables<"announcements">;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    unreadMessages: 0,
    recentAnnouncements: 0
  });

  useEffect(() => {
    if (!user) {
      // Redirect to auth page after 3 seconds
      const timer = setTimeout(() => {
        navigate("/auth");
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      fetchProfile();
      fetchRecentAnnouncements();
      fetchStats();
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data && !error) {
      setProfile(data);
    }
  };

  const fetchRecentAnnouncements = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data && !error) {
      setAnnouncements(data);
      setStats(prev => ({ ...prev, recentAnnouncements: data.length }));
    }
  };

  const fetchStats = async () => {
    // Get total students count
    const { count: studentsCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_verified", true);

    // Get unread messages count
    const { count: messagesCount } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", user?.id)
      .is("read_at", null);

    setStats(prev => ({
      ...prev,
      totalStudents: studentsCount || 0,
      unreadMessages: messagesCount || 0
    }));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      scholarships: "bg-emerald-100 text-emerald-800",
      jobs: "bg-amber-100 text-amber-800",
      sports: "bg-rose-100 text-rose-700",
      events: "bg-slate-100 text-slate-700",
      general: "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to access your dashboard.</p>
          <p className="text-sm text-gray-500">Redirecting to sign in page in 3 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="section-container py-8">
        {/* Welcome Header */}
        <div className="mb-10 slide-up">
          <h1 className="heading-2 mb-2">
            Welcome back, {profile?.first_name || "Student"}! 👋
          </h1>
          <p className="body-large text-muted-foreground">
            Here's what's happening in the NUGSA-Germany community today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="professional-card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Active Students</CardTitle>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Verified members</p>
            </CardContent>
          </Card>

          <Card className="professional-card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Unread Messages</CardTitle>
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary mb-1">{stats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">New messages</p>
            </CardContent>
          </Card>

          <Card className="professional-card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Recent Updates</CardTitle>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent mb-1">{stats.recentAnnouncements}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card className="professional-card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Profile Status</CardTitle>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                {profile?.is_verified ? "✓" : "⚡"}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile?.is_verified ? "Verified" : "Pending"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Announcements */}
          <Card className="professional-card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                Recent Announcements
              </CardTitle>
              <CardDescription className="mt-2">
                Stay updated with the latest news and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-1">
                            {announcement.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {announcement.content}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(announcement.category)}`}>
                              {announcement.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(announcement.created_at || "").toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent announcements</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button className="w-full" variant="outline" onClick={() => navigate("/announcements")}>
                  View All Announcements
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="professional-card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <PlusCircle className="w-5 h-5 text-primary" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription className="mt-2">
                Common tasks and features you might need
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-20 flex-col" variant="outline" onClick={() => navigate("/students")}>
                  <Users className="w-6 h-6 mb-2" />
                  <span className="text-sm">Find Students</span>
                </Button>
                <Button className="h-20 flex-col" variant="outline" onClick={() => navigate("/messages")}>
                  <MessageSquare className="w-6 h-6 mb-2" />
                  <span className="text-sm">Send Message</span>
                </Button>
                <Button className="h-20 flex-col" variant="outline" onClick={() => navigate("/assistance")}>
                  <Heart className="w-6 h-6 mb-2" />
                  <span className="text-sm">Get Support</span>
                </Button>
                <Button className="h-20 flex-col" variant="outline" onClick={() => navigate("/announcements")}>
                  <Calendar className="w-6 h-6 mb-2" />
                  <span className="text-sm">View Events</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion Reminder */}
        {profile && !profile.is_verified && (
          <Card className="mt-8 border-secondary/30 bg-secondary/5 professional-card-elevated">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center mr-3">
                  <BookOpen className="w-5 h-5 text-secondary" />
                </div>
                Complete Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Complete your profile to get verified and access all platform features.
              </p>
              <Button className="btn-secondary" onClick={() => navigate("/profile")}>
                Update Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
