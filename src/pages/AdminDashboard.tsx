import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { VerificationModule } from "@/components/admin/VerificationModule";
import { HeroSlideshowManager } from "@/components/admin/HeroSlideshowManager";
import { StudentDetailModal } from "@/components/admin/StudentDetailModal";
import { PlatformSettings } from "@/components/admin/PlatformSettings";
import {
  Users,
  FileText,
  Settings,
  Plus,
  Upload,
  Award,
  Calendar,
  Trash2,
  Eye,
  EyeOff,
  Edit,
  DollarSign,
  CreditCard,
  Phone,
  Mail,
  Filter,
  MessageSquare,
  Bell,
  Shield,
  UserCheck,
  UserX,
  Send,
  Smartphone,
  Search
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface BoardMember {
  id: string;
  name: string;
  position: string;
  academic_background: string;
  leadership_experience: string;
  quote: string;
  image_url: string;
  is_active: boolean;
  order_priority: number;
  year: string;
  created_at: string;
  updated_at: string;
}

interface ConstitutionDoc {
  id: string;
  title: string;
  file_url: string;
  version: string;
  is_current: boolean;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  featured: boolean;
  published: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
}

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

interface AssistanceRequest {
  id: string;
  student_id: string;
  title: string;
  request_type: string;
  description: string;
  urgency_level: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at?: string;
  reviewed_by?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    university: string;
    phone: string;
    current_state: string;
    current_city: string;
    india_pincode: string;
  };
}

interface FinanceSettings {
  bank_transfer_details: {
    bank_name: string;
    account_name: string;
    account_number: string;
    swift_code: string;
    upi_id: string;
  };
  mobile_money_details: {
    provider: string;
    number: string;
    name: string;
  };
  contact_details: {
    treasurer_name: string;
    treasurer_email: string;
    treasurer_phone: string;
    finance_email: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("verification");
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    pendingVerifications: 0,
    totalInquiries: 0,
    pendingInquiries: 0
  });

  // Board Members State
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [yearFilter, setYearFilter] = useState("2024-2025");
  const [positionFilter, setPositionFilter] = useState("");
  const [editingBoardMember, setEditingBoardMember] = useState<BoardMember | null>(null);
  const [newBoardMember, setNewBoardMember] = useState({
    name: '',
    position: '',
    academic_background: '',
    leadership_experience: '',
    quote: '',
    image_url: '',
    year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  });
  const [selectedBoardMemberImage, setSelectedBoardMemberImage] = useState<File | null>(null);

  // Constitution State
  const [constitutionDocs, setConstitutionDocs] = useState<ConstitutionDoc[]>([]);
  const [newConstitution, setNewConstitution] = useState({
    title: '',
    version: '',
    is_current: true
  });
  const [selectedConstitutionFile, setSelectedConstitutionFile] = useState<File | null>(null);

  // Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'general',
    featured: false,
    published: true
  });
  const [selectedAnnouncementImages, setSelectedAnnouncementImages] = useState<File[]>([]);

  // Contact Inquiries State
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState("all");

  // Assistance Requests State
  const [assistanceRequests, setAssistanceRequests] = useState<AssistanceRequest[]>([]);
  const [assistanceFilter, setAssistanceFilter] = useState("all");

  // Finance State
  const [financeSettings, setFinanceSettings] = useState<FinanceSettings>({
    bank_transfer_details: {
      bank_name: "",
      account_name: "",
      account_number: "",
      swift_code: "",
      upi_id: ""
    },
    mobile_money_details: {
      provider: "",
      number: "",
      name: ""
    },
    contact_details: {
      treasurer_name: "",
      treasurer_email: "",
      treasurer_phone: "",
      finance_email: ""
    }
  });

  // Student Detail Modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        navigate("/auth");
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Check if user is admin
      checkAdminAccess();
    }
  }, [user, navigate]);

  const checkAdminAccess = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, is_verified")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profile?.role !== "admin" || !profile?.is_verified) {
        setAccessDenied(true);
        setUserRole(profile?.role);
        setIsVerified(profile?.is_verified);
        return;
      }

      // User is admin, fetch data
      fetchStats();
      fetchBoardMembers();
      fetchConstitutionDocs();
      fetchAnnouncements();
      fetchContactInquiries();
      fetchAssistanceRequests();
      fetchFinanceSettings();
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
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    }
  };

  const fetchBoardMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('board_members')
        .select('*')
        .order('order_priority', { ascending: true });

      if (error) throw error;
      setBoardMembers(data || []);
    } catch (error) {
      console.error('Error fetching board members:', error);
      toast({
        title: "Error",
        description: "Failed to load board members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConstitutionDocs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('constitution_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConstitutionDocs(data || []);
    } catch (error) {
      console.error('Error fetching constitution documents:', error);
      toast({
        title: "Error",
        description: "Failed to load constitution documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchContactInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContactInquiries(data || []);
    } catch (error) {
      console.error('Error fetching contact inquiries:', error);
      toast({
        title: "Error",
        description: "Failed to load contact inquiries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssistanceRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assistance_requests')
        .select(`
          *,
          profiles!assistance_requests_student_id_fkey (
            first_name,
            last_name,
            university,
            phone,
            current_state,
            current_city,
            india_pincode
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssistanceRequests(
        (data || []).map((item: any) => ({
          ...item,
          status: item.status as 'pending' | 'in_progress' | 'resolved'
        }))
      );
    } catch (error) {
      console.error('Error fetching assistance requests:', error);
      toast({
        title: "Error",
        description: "Failed to load assistance requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFinanceSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*');

      if (error) throw error;

      const settings: FinanceSettings = {
        bank_transfer_details: {
          bank_name: "",
          account_name: "",
          account_number: "",
          swift_code: "",
          upi_id: ""
        },
        mobile_money_details: {
          provider: "",
          number: "",
          name: ""
        },
        contact_details: {
          treasurer_name: "",
          treasurer_email: "",
          treasurer_phone: "",
          finance_email: ""
        }
      };

      data?.forEach(setting => {
        if (setting.setting_key === 'bank_transfer_details') {
          settings.bank_transfer_details = typeof setting.setting_value === "string"
            ? JSON.parse(setting.setting_value)
            : setting.setting_value;
        } else if (setting.setting_key === 'mobile_money_details') {
          settings.mobile_money_details = typeof setting.setting_value === "string"
            ? JSON.parse(setting.setting_value)
            : setting.setting_value;
        } else if (setting.setting_key === 'contact_details') {
          settings.contact_details = typeof setting.setting_value === "string"
            ? JSON.parse(setting.setting_value)
            : setting.setting_value;
        }
      });

      setFinanceSettings(settings);
    } catch (error) {
      console.error('Error fetching finance settings:', error);
      toast({
        title: "Error",
        description: "Failed to load finance settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConstitution = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('constitution_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Constitution document deleted successfully",
      });
      fetchConstitutionDocs();
    } catch (error) {
      console.error('Error deleting constitution document:', error);
      toast({
        title: "Error",
        description: "Failed to delete constitution document",
        variant: "destructive",
      });
    }
  };

  const handleBoardMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let imageUrl = '';

      if (selectedBoardMemberImage) {
        const fileExt = selectedBoardMemberImage.name.split('.').pop();
        const fileName = `board-member-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('board-images')
          .upload(fileName, selectedBoardMemberImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('board-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      if (editingBoardMember) {
        const { error } = await supabase
          .from('board_members')
          .update({
            ...newBoardMember,
            image_url: imageUrl || editingBoardMember.image_url,
          })
          .eq('id', editingBoardMember.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Board member updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('board_members')
          .insert({
            ...newBoardMember,
            image_url: imageUrl,
            is_active: true,
            order_priority: boardMembers.length + 1
          });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Board member added successfully!",
        });
      }

      setNewBoardMember({
        name: '',
        position: '',
        academic_background: '',
        leadership_experience: '',
        quote: '',
        image_url: '',
        year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
      });
      setSelectedBoardMemberImage(null);
      setEditingBoardMember(null);
      fetchBoardMembers();
    } catch (error) {
      console.error('Error saving board member:', error);
      toast({
        title: "Error",
        description: "Failed to save board member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConstitutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConstitutionFile) return;

    setLoading(true);
    try {
      const fileExt = selectedConstitutionFile.name.split('.').pop();
      const fileName = `constitution-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('constitution-docs')
        .upload(fileName, selectedConstitutionFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('constitution-docs')
        .getPublicUrl(fileName);

      // Mark all existing constitutions as not current if this one should be current
      if (newConstitution.is_current) {
        await supabase
          .from('constitution_documents')
          .update({ is_current: false })
          .neq('id', '');
      }

      const { error } = await supabase
        .from('constitution_documents')
        .insert({
          ...newConstitution,
          file_url: publicUrl,
          uploaded_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Constitution document added successfully!",
      });

      setNewConstitution({
        title: '',
        version: '',
        is_current: false
      });
      setSelectedConstitutionFile(null);
      fetchConstitutionDocs();
    } catch (error) {
      console.error('Error adding constitution document:', error);
      toast({
        title: "Error",
        description: "Failed to add constitution document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let imageUrls: string[] = [];
      let legacyImageUrl = '';
      let joinedImageUrls = '';

      if (selectedAnnouncementImages.length > 0) {
        for (const image of selectedAnnouncementImages) {
          const fileExt = image.name.split('.').pop();
          const fileName = `announcement-${Date.now()}-${Math.random()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('news-images')
            .upload(fileName, image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('news-images')
            .getPublicUrl(fileName);

          imageUrls.push(publicUrl);
          joinedImageUrls = imageUrls.join(';');
        }

        legacyImageUrl = imageUrls[0] || '';
      }

      const { error } = await supabase
        .from('announcements')
        .insert([{
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          category: newAnnouncement.category as any,
          featured: newAnnouncement.featured,
          published: newAnnouncement.published,
          image_url: imageUrls[0] || null,
          author_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement added successfully!",
      });

      setNewAnnouncement({
        title: '',
        content: '',
        category: 'general',
        featured: false,
        published: true
      });
      setSelectedAnnouncementImages([]);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error adding announcement:', error);
      toast({
        title: "Error",
        description: "Failed to add announcement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInquiryStatusUpdate = async (inquiryId: string, status: 'pending' | 'in_progress' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
          resolved_by: status === 'resolved' ? user?.id : null
        })
        .eq('id', inquiryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Inquiry marked as ${status.replace('_', ' ')}`,
      });
      fetchContactInquiries();
      fetchStats();
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast({
        title: "Error",
        description: "Failed to update inquiry status",
        variant: "destructive",
      });
    }
  };

  const handleAssistanceStatusUpdate = async (requestId: string, status: 'pending' | 'in_progress' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('assistance_requests')
        .update({
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
          reviewed_by: user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Assistance request marked as ${status.replace('_', ' ')}`,
      });
      fetchAssistanceRequests();
    } catch (error) {
      console.error('Error updating assistance request:', error);
      toast({
        title: "Error",
        description: "Failed to update assistance request",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .delete()
        .eq('id', inquiryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Inquiry deleted successfully",
      });
      fetchContactInquiries();
      fetchStats();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast({
        title: "Error",
        description: "Failed to delete inquiry",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBoardMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('board_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Board member deleted successfully",
      });
      fetchBoardMembers();
    } catch (error) {
      console.error('Error deleting board member:', error);
      toast({
        title: "Error",
        description: "Failed to delete board member",
        variant: "destructive",
      });
    }
  };

  const handleFinanceUpdate = async (settingKey: keyof FinanceSettings) => {
    try {
      const { error } = await supabase
        .from('organization_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: financeSettings[settingKey]
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Finance settings updated successfully",
      });
      fetchFinanceSettings();
    } catch (error) {
      console.error('Error updating finance settings:', error);
      toast({
        title: "Error",
        description: "Failed to update finance settings",
        variant: "destructive",
      });
    }
  };

  const filteredInquiries = contactInquiries.filter(inquiry =>
    inquiryFilter === "all" || inquiry.status === inquiryFilter
  );

  const filteredAssistanceRequests = assistanceRequests.filter(request =>
    assistanceFilter === "all" || request.status === assistanceFilter
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access the admin dashboard</p>
        </div>
      </div>
    );
  }

  function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff} second${diff !== 1 ? "s" : ""} ago`;
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  }

  const renderBoardMembersTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {editingBoardMember ? <Edit className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
            {editingBoardMember ? "Edit Board Member" : "Add New Board Member"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBoardMemberSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member-name">Name</Label>
                <Input
                  id="member-name"
                  value={newBoardMember.name}
                  onChange={(e) => setNewBoardMember({ ...newBoardMember, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="member-position">Position</Label>
                <Input
                  id="member-position"
                  value={newBoardMember.position}
                  onChange={(e) => setNewBoardMember({ ...newBoardMember, position: e.target.value })}
                  placeholder="e.g., President, Vice President"
                  required
                />
              </div>
              <div>
                <Label htmlFor="member-year">Year</Label>
                <Select
                  value={newBoardMember.year}
                  onValueChange={(value) => setNewBoardMember({ ...newBoardMember, year: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {Array.from({ length: 7 }, (_, i) => {
                      const startYear = 2019 + i;
                      const endYear = startYear + 1;
                      const yearRange = `${startYear}-${endYear}`;
                      return (
                        <SelectItem key={yearRange} value={yearRange}>
                          {yearRange}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="member-image">Profile Image</Label>
                <Input
                  id="member-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedBoardMemberImage(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="member-academic">Academic Background</Label>
              <Textarea
                id="member-academic"
                value={newBoardMember.academic_background}
                onChange={(e) => setNewBoardMember({ ...newBoardMember, academic_background: e.target.value })}
                placeholder="Enter academic background"
              />
            </div>
            <div>
              <Label htmlFor="member-leadership">Leadership Experience</Label>
              <Textarea
                id="member-leadership"
                value={newBoardMember.leadership_experience}
                onChange={(e) => setNewBoardMember({ ...newBoardMember, leadership_experience: e.target.value })}
                placeholder="Enter leadership experience"
              />
            </div>
            <div>
              <Label htmlFor="member-quote">Quote/Vision</Label>
              <Textarea
                id="member-quote"
                value={newBoardMember.quote}
                onChange={(e) => setNewBoardMember({ ...newBoardMember, quote: e.target.value })}
                placeholder="Enter inspiring quote or vision"
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {editingBoardMember ? (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    {loading ? "Updating..." : "Update Member"}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {loading ? "Adding..." : "Add Member"}
                  </>
                )}
              </Button>
              {editingBoardMember && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingBoardMember(null);
                    setNewBoardMember({
                      name: '',
                      position: '',
                      academic_background: '',
                      leadership_experience: '',
                      quote: '',
                      image_url: '',
                      year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
                    });
                    setSelectedBoardMemberImage(null);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Board Members Management
            </div>
            <div className="flex space-x-2">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent>

                  {Array.from({ length: ((new Date()).getFullYear() - 2019 + 1) }, (_, i) => {
                    const startYear = 2019 + i;
                    const endYear = startYear + 1;
                    const yearRange = `${startYear}-${endYear}`;
                    return (
                      <SelectItem key={yearRange} value={yearRange}>
                        {yearRange}
                      </SelectItem>
                    );
                  })}

                </SelectContent>
              </Select>
              <Input
                placeholder="Filter by position..."
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-48"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boardMembers
                  .filter(member => {
                    const yearMatch = !yearFilter || member.year === yearFilter;
                    const positionMatch = !positionFilter || member.position.toLowerCase().includes(positionFilter.toLowerCase());
                    return yearMatch && positionMatch;
                  })
                  .map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <img
                          src={member.image_url || "/default-profile.png"}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>{member.year}</TableCell>
                      <TableCell>
                        <Badge variant={member.is_active ? "default" : "secondary"}>
                          {member.is_active ? "Active" : "Hidden"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from('board_members')
                                  .update({ is_active: !member.is_active })
                                  .eq('id', member.id);

                                if (error) throw error;

                                toast({
                                  title: "Success",
                                  description: `Board member ${!member.is_active ? 'hidden' : 'shown'} successfully!`,
                                });

                                fetchBoardMembers();
                              } catch (error) {
                                console.error('Error updating board member status:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to update board member status",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            {member.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingBoardMember(member);
                              setNewBoardMember({
                                name: member.name,
                                position: member.position,
                                academic_background: member.academic_background,
                                leadership_experience: member.leadership_experience,
                                quote: member.quote,
                                image_url: member.image_url,
                                year: member.year
                              });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Board Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{member.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBoardMember(member.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConstitutionTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add New Constitution Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConstitutionSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="constitution-title">Title</Label>
                <Input
                  id="constitution-title"
                  value={newConstitution.title}
                  onChange={(e) => setNewConstitution({ ...newConstitution, title: e.target.value })}
                  placeholder="Enter document title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="constitution-version">Version</Label>
                <Input
                  id="constitution-version"
                  value={newConstitution.version}
                  onChange={(e) => setNewConstitution({ ...newConstitution, version: e.target.value })}
                  placeholder="Enter version number"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="constitution-file">Document File (PDF)</Label>
              <Input
                id="constitution-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setSelectedConstitutionFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Adding..." : "Add Document"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Constitution Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {constitutionDocs.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{doc.title}</h4>
                    <Badge variant={doc.is_current ? "default" : "secondary"}>
                      {doc.is_current ? "Current" : "Archived"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Version: {doc.version}</p>
                  <div className="flex items-center justify-between mt-4">
                    <Badge variant={new Date(doc.created_at).getFullYear() >= (new Date).getFullYear() ? "default" : "secondary"}>
                      {timeAgo(doc.created_at)}
                    </Badge>
                    <div className="flex space-x-2">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View
                      </a>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-0 h-auto">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Constitution Document</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{doc.title}" (Version {doc.version})? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteConstitution(doc.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnnouncementsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add New Announcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
            <div>
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                placeholder="Enter announcement title"
                required
              />
            </div>
            <div>
              <Label htmlFor="announcement-content">Content</Label>
              <Textarea
                id="announcement-content"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                placeholder="Enter announcement content"
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="announcement-category">Category</Label>
                <Select
                  value={newAnnouncement.category}
                  onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="scholarships">Scholarships</SelectItem>
                    <SelectItem value="jobs">Jobs</SelectItem>
                    <SelectItem value="internships">Internships</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="announcement-image">Images (optional)</Label>
                <Input
                  id="announcement-image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setSelectedAnnouncementImages(Array.from(e.target.files || []))}
                />
                {selectedAnnouncementImages.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedAnnouncementImages.length} image{selectedAnnouncementImages.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="announcement-featured"
                  checked={newAnnouncement.featured}
                  onCheckedChange={(checked) => setNewAnnouncement({ ...newAnnouncement, featured: checked })}
                />
                <Label htmlFor="announcement-featured">Featured</Label>
              </div>
              {/* <div className="flex items-center space-x-2">
                <Switch
                  id="announcement-published"
                  checked={newAnnouncement.published}
                  onCheckedChange={(checked) => setNewAnnouncement({...newAnnouncement, published: checked})}
                />
                <Label htmlFor="announcement-published">Published</Label>
              </div> */}
            </div>
            <Button type="submit" disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Adding..." : "Add Announcement"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Current Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                {announcement.image_url && (() => {
                  try {
                    // Try to parse as JSON array (for legacy data)
                    const urls = JSON.parse(announcement.image_url);
                    if (Array.isArray(urls)) {
                      return (
                        <div className="aspect-video bg-gray-100">
                          <img
                            src={urls[0]}
                            alt={announcement.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    }
                  } catch {
                    // If parsing fails, treat as a single URL string
                  }
                  // Handle as a single URL string
                  return (
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })()}
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{announcement.title}</h4>
                    <div className="flex space-x-1">
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        {announcement.category}
                      </Badge>
                      {announcement.featured && (
                        <Badge variant="default" className="text-[10px] px-1 py-0">Featured</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {announcement.content}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[10px] text-gray-500">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContactInquiriesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact Inquiries
            </div>
            <Select value={inquiryFilter} onValueChange={setInquiryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">{inquiry.name}</TableCell>
                    <TableCell>{inquiry.email}</TableCell>
                    <TableCell>{inquiry.phone}</TableCell>
                    <TableCell>{inquiry.subject}</TableCell>
                    <TableCell>{inquiry.message}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inquiry.status === 'pending' ? 'secondary' :
                            inquiry.status === 'resolved' ? 'default' : 'outline'
                        }
                      >
                        {inquiry.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {inquiry.status !== 'resolved' && (
                          <Button
                            size="sm"
                            onClick={() => handleInquiryStatusUpdate(inquiry.id, 'resolved')}
                          >
                            Mark Resolved
                          </Button>
                        )}
                        {inquiry.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInquiryStatusUpdate(inquiry.id, 'in_progress')}
                          >
                            In Progress
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this inquiry? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteInquiry(inquiry.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAssistanceRequestsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Assistance Requests
            </div>
            <Select value={assistanceFilter} onValueChange={setAssistanceFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssistanceRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-left"
                        onClick={() => {
                          setSelectedStudentId(request.student_id);
                          setStudentModalOpen(true);
                        }}
                      >
                        {request.profiles?.first_name} {request.profiles?.last_name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{request.title}</div>
                        <div className="text-muted-foreground">{request.request_type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {request.urgency_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === 'pending' ? 'secondary' :
                            request.status === 'resolved' ? 'default' : 'outline'
                        }
                      >
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {request.status !== 'resolved' && (
                          <Button
                            size="sm"
                            onClick={() => handleAssistanceStatusUpdate(request.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        )}
                        {request.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssistanceStatusUpdate(request.id, 'in_progress')}
                          >
                            In Progress
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFinanceTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Bank Transfer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Bank Name</Label>
              <Input
                value={financeSettings.bank_transfer_details.bank_name}
                onChange={(e) => setFinanceSettings({
                  ...financeSettings,
                  bank_transfer_details: {
                    ...financeSettings.bank_transfer_details,
                    bank_name: e.target.value
                  }
                })}
                placeholder="Enter bank name"
              />
            </div>
            <div>
              <Label>Account Name</Label>
              <Input
                value={financeSettings.bank_transfer_details.account_name}
                onChange={(e) => setFinanceSettings({
                  ...financeSettings,
                  bank_transfer_details: {
                    ...financeSettings.bank_transfer_details,
                    account_name: e.target.value
                  }
                })}
                placeholder="Enter account name"
              />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input
                value={financeSettings.bank_transfer_details.account_number}
                onChange={(e) => setFinanceSettings({
                  ...financeSettings,
                  bank_transfer_details: {
                    ...financeSettings.bank_transfer_details,
                    account_number: e.target.value
                  }
                })}
                placeholder="Enter account number"
              />
            </div>
            <div>
              <Label>SWIFT Code</Label>
              <Input
                value={financeSettings.bank_transfer_details.swift_code}
                onChange={(e) => setFinanceSettings({
                  ...financeSettings,
                  bank_transfer_details: {
                    ...financeSettings.bank_transfer_details,
                    swift_code: e.target.value
                  }
                })}
                placeholder="Enter SWIFT code"
              />
            </div>
            <div>
              <Label>UPI ID</Label>
              <Input
                value={financeSettings.bank_transfer_details.upi_id}
                onChange={(e) => setFinanceSettings({
                  ...financeSettings,
                  bank_transfer_details: {
                    ...financeSettings.bank_transfer_details,
                    upi_id: e.target.value
                  }
                })}
                placeholder="Enter UPI ID"
              />
            </div>
          </div>
          <Button
            onClick={() => handleFinanceUpdate('bank_transfer_details')}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Bank Details"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            Mobile Money Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Provider</Label>
              <Input
                value={financeSettings.mobile_money_details.provider}
                onChange={(e) => setFinanceSettings({
                  ...financeSettings,
                  mobile_money_details: {
                    ...financeSettings.mobile_money_details,
                    provider: e.target.value
                  }
                })}
                placeholder="Enter provider (e.g. MTN)"
              />
            </div>
            <div>
              <Label>Mobile Number</Label>
              <Input
                value={financeSettings.mobile_money_details.number}
                onChange={(e) => setFinanceSettings({
                  ...financeSettings,
                  mobile_money_details: {
                    ...financeSettings.mobile_money_details,
                    number: e.target.value
                  }
                })}
                placeholder="Enter mobile number"
              />
            </div>
            <div>
              <Label>Account Name</Label>
              <Input
                value={financeSettings.mobile_money_details.name}
                onChange={(e) => setFinanceSettings({
                  ...financeSettings,
                  mobile_money_details: {
                    ...financeSettings.mobile_money_details,
                    name: e.target.value
                  }
                })}
                placeholder="Enter account name"
              />
            </div>
          </div>
          <Button
            onClick={() => handleFinanceUpdate('mobile_money_details')}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Mobile Money Details"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Treasurer Name</Label>
              <Input
                value={financeSettings.contact_details.treasurer_name}
                onChange={(e) => setFinanceSettings({
                  ...financeSettings,
                  contact_details: {
                    ...financeSettings.contact_details,
                    treasurer_name: e.target.value
                  }
                })}
                placeholder="Enter treasurer name"
              />
            </div>
            <div>
              <Label>Treasurer Email</Label>
              <Input
                type="email"
                value={financeSettings.contact_details.treasurer_email}
                onChange={(e) => setFinanceSettings({
                  ...financeSettings,
                  contact_details: {
                    ...financeSettings.contact_details,
                    treasurer_email: e.target.value
                  }
                })}
                placeholder="Enter treasurer email"
              />
            </div>
            <div>
              <Label>Treasurer Phone</Label>
              <Input
                value={financeSettings.contact_details.treasurer_phone}
                onChange={(e) => setFinanceSettings({
                  ...financeSettings,
                  contact_details: {
                    ...financeSettings.contact_details,
                    treasurer_phone: e.target.value
                  }
                })}
                placeholder="Enter treasurer phone"
              />
            </div>
            <div>
              <Label>Finance Email</Label>
              <Input
                type="email"
                value={financeSettings.contact_details.finance_email}
                onChange={(e) => setFinanceSettings({
                  ...financeSettings,
                  contact_details: {
                    ...financeSettings.contact_details,
                    finance_email: e.target.value
                  }
                })}
                placeholder="Enter finance email"
              />
            </div>
          </div>
          <Button
            onClick={() => handleFinanceUpdate('contact_details')}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Contact Details"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Platform Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="maintenance-mode" />
            <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="registration-enabled" />
            <Label htmlFor="registration-enabled">Allow New Registrations</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="email-notifications" />
            <Label htmlFor="email-notifications">Enable Email Notifications</Label>
          </div>
          <Button className="mt-4">
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You do not have permission to view the Admin Dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md space-y-2">
              <p><strong>Current Role:</strong> {userRole || 'None'}</p>
              <p><strong>Verified:</strong> {isVerified ? 'Yes' : 'No'}</p>
              <p><strong>User ID:</strong> {user?.id}</p>
            </div>
            <div className="text-sm text-gray-600">
              <p>To fix this, please run the SQL command to update your role to 'admin' and is_verified to true.</p>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Go to Student Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage all aspects of the NUGSA - Germany platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <UserX className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
              <Mail className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInquiries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Inquiries</CardTitle>
              <Bell className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingInquiries}</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b">
          {[
            { id: "verification", label: "Verification", icon: UserCheck },
            { id: "board", label: "Board Members", icon: Users },
            { id: "constitution", label: "Constitution", icon: FileText },
            { id: "announcements", label: "Announcements", icon: Bell },
            { id: "inquiries", label: "Contact Inquiries", icon: Mail },
            { id: "assistance", label: "Assistance Requests", icon: Settings },
            { id: "finance", label: "Finance", icon: DollarSign },
            { id: "hero", label: "Hero Images", icon: Calendar },
            { id: "platform", label: "Platform Settings", icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === id
                ? "bg-primary text-primary-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-primary"
                }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "verification" && <VerificationModule onStatsUpdate={fetchStats} />}
          {activeTab === "board" && renderBoardMembersTab()}
          {activeTab === "constitution" && renderConstitutionTab()}
          {activeTab === "announcements" && renderAnnouncementsTab()}
          {activeTab === "inquiries" && renderContactInquiriesTab()}
          {activeTab === "assistance" && renderAssistanceRequestsTab()}
          {activeTab === "finance" && renderFinanceTab()}
          {activeTab === "hero" && <HeroSlideshowManager />}
          {activeTab === "platform" && <PlatformSettings />}
        </div>

        {/* Student Detail Modal */}
        <StudentDetailModal
          studentId={selectedStudentId}
          open={studentModalOpen}
          onClose={() => {
            setStudentModalOpen(false);
            setSelectedStudentId(null);
          }}
        />
      </div>
    </div>
  );
}