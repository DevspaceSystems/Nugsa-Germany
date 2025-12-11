import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, Settings, MessageSquare, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { NotificationManager } from "@/components/notifications/NotificationManager";

type Profile = Tables<"profiles">;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data && !error) {
      setUserProfile(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardLink = () => {
    if ((userProfile?.role === 'admin' && userProfile?.is_verified) || (userProfile as any)?.managed_chapter_id) {
      return "/admin-dashboard";
    }
    return "/dashboard";
  };

  /* Navigation Data Structure */
  const getNavStructure = () => {
    const communityItems = [
      { label: t('nav.chapters'), path: "/chapters" },
      { label: t('nav.gallery'), path: "/gallery" },
      { label: "Directory", path: "/students" },
      { label: t('nav.announcements'), path: "/announcements" },
    ];

    const canAccessAdmin = (userProfile?.role === 'admin' && userProfile?.is_verified) || (userProfile as any)?.managed_chapter_id;

    if (user) {
      return [
        { label: t('nav.home'), path: "/" },
        { label: t('nav.about'), path: "/about" },
        // Show Dashboard link if admin or chapter lead, otherwise it's user dashboard which is also valid but maybe distinct?
        // Actually getDashboardLink() returns /admin-dashboard OR /dashboard.
        // So we always show "Dashboard" but the destination changes.
        { label: t('nav.dashboard'), path: getDashboardLink() },
        {
          label: "Community",
          type: "dropdown",
          items: communityItems
        },
        { label: "Support", path: "/support" },
      ];
    }

    return [
      { label: t('nav.home'), path: "/" },
      { label: t('nav.about'), path: "/about" },
      {
        label: "Community",
        type: "dropdown",
        items: communityItems
      },
      { label: "Support", path: "/support" },
      { label: t('nav.contact'), path: "/contact" },
    ];
  };

  const navItems = getNavStructure();

  // Helper for mobile menu to flatten the structure
  const mobileNavLinks = navItems.reduce((acc: any[], item: any) => {
    if (item.type === "dropdown") {
      return [...acc, ...item.items];
    }
    return [...acc, item];
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-lg blur-sm group-hover:blur-md transition-all"></div>
              <img
                src="/icon.png"
                alt="NUGSA-Germany Logo"
                className="relative w-12 h-12 rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary tracking-tight">NUGSA-Germany</span>
              <span className="text-xs text-muted-foreground font-medium">Student Association</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 flex-shrink-0 overflow-x-auto">
            {navItems.map((item: any) => {
              if (item.type === "dropdown") {
                return (
                  <DropdownMenu key={item.label}>
                    <DropdownMenuTrigger className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors rounded-md whitespace-nowrap flex items-center gap-1 focus:outline-none">
                      {item.label}
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48">
                      {item.items.map((subItem: any) => (
                        <DropdownMenuItem key={subItem.path} asChild>
                          <Link to={subItem.path} className="w-full cursor-pointer">
                            {subItem.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors rounded-md whitespace-nowrap flex-shrink-0"
                >
                  {item.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <Link
                  to="/messages"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors rounded-md relative whitespace-nowrap"
                >
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Messages
                </Link>

                <NotificationManager />
                <LanguageSwitcher />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="ml-2 px-3 py-2 h-auto text-sm font-medium text-foreground hover:text-primary hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {userProfile?.first_name || "Account"}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <div className="px-2 py-1.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-foreground">
                        {userProfile?.first_name} {userProfile?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {userProfile?.email}
                      </p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      {t('nav.profile')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="ml-4 flex items-center space-x-3">
                <LanguageSwitcher />
                <Link to="/auth">
                  <Button variant="ghost" className="text-sm font-medium">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-primary hover:bg-primary/90 text-sm font-semibold px-6">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {mobileNavLinks.map((link: any) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/messages"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Messages
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 space-y-2">
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-center text-base font-medium text-foreground hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-center text-base font-semibold text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
