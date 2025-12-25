import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    CreditCard,
    MessageSquare,
    ShieldCheck,
    Building2,
    ImageIcon,
    Menu,
    X,
    LogOut,
    Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AdminSidebarProps {
    activeSection: string;
    onSectionChange: (section: string) => void;
    userRole?: string | null;
    isChapterLead?: boolean;
}

export function AdminSidebar({
    activeSection,
    onSectionChange,
    userRole,
    isChapterLead
}: AdminSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { signOut } = useAuth();

    const toggleSidebar = () => setIsOpen(!isOpen);

    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            show: true
        },
        {
            id: "verification",
            label: "Verification",
            icon: ShieldCheck,
            show: true
        },
        {
            id: "chapters",
            label: "Chapters",
            icon: Building2,
            show: true
        },
        {
            id: "users",
            label: "User Management",
            icon: Users,
            show: userRole === 'admin'
        },
        {
            id: "board",
            label: "Board Members",
            icon: Users,
            show: userRole === 'admin'
        },
        {
            id: "announcements",
            label: "Announcements",
            icon: FileText,
            show: userRole === 'admin'
        },
        {
            id: "gallery",
            label: "Gallery",
            icon: ImageIcon,
            show: userRole === 'admin'
        },
        {
            id: "constitution",
            label: "Constitution",
            icon: FileText,
            show: userRole === 'admin'
        },
        {
            id: "inquiries",
            label: "Inquiries",
            icon: MessageSquare,
            show: userRole === 'admin'
        },
        {
            id: "assistance",
            label: "Assistance",
            icon: Heart,
            show: userRole === 'admin'
        },
        {
            id: "finance",
            label: "Finance",
            icon: CreditCard,
            show: userRole === 'admin'
        },
        {
            id: "settings",
            label: "Settings",
            icon: Settings,
            show: userRole === 'admin'
        }
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white/50 backdrop-blur-md border-r">
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Admin Portal
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {isChapterLead ? 'Chapter Lead' : 'Global Admin'}
                </p>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuItems.filter(item => item.show).map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onSectionChange(item.id);
                            setIsOpen(false);
                        }}
                        className={cn(
                            "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            activeSection === item.id
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-gray-100 hover:text-gray-900"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => signOut()}
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button variant="outline" size="icon" onClick={toggleSidebar}>
                    {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
            </div>

            {/* Mobile Sidebar (Drawer) */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out md:hidden bg-white",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <SidebarContent />
            </div>

            {/* Desktop Sidebar (Static) */}
            <div className="hidden md:block w-64 border-r bg-white h-full min-h-[calc(100vh-5rem)]">
                <SidebarContent />
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
