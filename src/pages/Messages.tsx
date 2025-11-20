import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  User, 
  ChevronLeft, 
  Menu, 
  MoreVertical, 
  Image, 
  Video, 
  Paperclip,
  X,
  Smile,
  Play,
  Grid,
  RefreshCw,
  WifiOff,
  Shield,
  Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'

type Profile = Tables<"profiles">;
type Message = Tables<"messages">;

type ContactProfile = {
  id: string;
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  is_verified: boolean;
};

type ConversationMessage = Message & {
  sender_profile: ContactProfile;
  images?: string | null;
};

type Conversation = {
  contact: ContactProfile;
  lastMessage: ConversationMessage | null;
  unreadCount: number;
};

// Media Gallery Component (keep as is)
const MediaGallery = ({ 
  media, 
  isOpen, 
  onClose, 
  initialIndex = 0 
}: { 
  media: string[]; 
  isOpen: boolean; 
  onClose: () => void; 
  initialIndex?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  if (!isOpen) return null;

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia.endsWith('.mp4') || currentMedia.endsWith('.mov') || currentMedia.endsWith('.webm');

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/70 text-white">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          <X className="h-6 w-6" />
        </Button>
        <div className="text-lg font-medium">
          {currentIndex + 1} of {media.length}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white"
        >
          <Grid className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Media Content */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          {isVideo ? (
            <video 
              src={currentMedia} 
              controls 
              autoPlay
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <img 
              src={currentMedia} 
              alt={`Media ${currentIndex + 1}`} 
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white bg-black/50 hover:bg-black/70 h-12 w-12 rounded-full"
              onClick={goPrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white bg-black/50 hover:bg-black/70 h-12 w-12 rounded-full"
              onClick={goNext}
            >
              <ChevronLeft className="h-6 w-6 rotate-180" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Grid */}
      {isExpanded && (
        <div className="p-4 bg-black/70">
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {media.map((item, index) => (
              <div
                key={index}
                className={`relative aspect-square cursor-pointer border-2 ${index === currentIndex ? 'border-green-500' : 'border-transparent'}`}
                onClick={() => setCurrentIndex(index)}
              >
                {item.endsWith('.mp4') || item.endsWith('.mov') || item.endsWith('.webm') ? (
                  <div className="relative h-full w-full">
                    <video src={item} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white/80" fill="white" />
                    </div>
                  </div>
                ) : (
                  <img src={item} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Verification Check Hook
function useVerificationStatus() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsVerified(false);
        setLoading(false);
        return;
      }

      // Check email confirmation first
      if (user.email_confirmed_at) {
        setIsVerified(true);
        setLoading(false);
        return;
      }

      // Fallback to profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_verified')
        .single();

      if (error) {
        console.log("Profile not found or user not verified");
        setIsVerified(false);
      } else {
        setIsVerified(profile?.is_verified || false);
      }
    } catch (error) {
      console.error("Error checking verification:", error);
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkVerificationStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          await checkVerificationStatus();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { isVerified, loading, checkVerificationStatus };
}

// Admin Approval Required Component
const AdminApprovalRequired = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full mx-auto shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Account Pending Approval
          </CardTitle>
          <CardDescription className="text-sm mt-2">
            Your account is awaiting admin approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">
                  What's happening?
                </p>
                <p className="text-sm text-blue-700">
                  Your account is currently under review by our administration team. 
                  You'll be able to access all features once your account is approved.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>Please check back later or contact support if this takes longer than expected.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Messages() {
  const { user } = useAuth();
  const { isVerified, loading: verificationLoading } = useVerificationStatus();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [contacts, setContacts] = useState<ContactProfile[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedMessageImages, setSelectedMessageImages] = useState<File[]>([]);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [mediaGalleryOpen, setMediaGalleryOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [initialMediaIndex, setInitialMediaIndex] = useState(0);
  const [connectionError, setConnectionError] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  // Only setup messaging features if user is verified
  useEffect(() => {
    if (user && isVerified === true) {
      fetchConversations();
      fetchContacts();
      
      const channel = setupRealtimeSubscription();

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      };
    } else if (user && isVerified === false) {
      // If user is not verified, set loading to false to show the empty state
      setLoading(false);
    }
  }, [user, isVerified, activeConversation]);

  // Function to set up real-time subscription with error handling
  const setupRealtimeSubscription = () => {
    if (!user || isVerified !== true) return null;

    try {
      supabase.removeChannel(supabase.channel('messages-changes'));

      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            if (
              payload.new &&
              (
                (payload.new as Message).sender_id === user.id ||
                (payload.new as Message).recipient_id === user.id
              )
            ) {
              console.log('Real-time update:', payload);
              fetchConversations();
              if (activeConversation) {
                fetchConversationMessages(activeConversation);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('WebSocket status:', status);
          if (status === 'SUBSCRIBED') {
            setConnectionError(false);
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setConnectionError(true);
          }
        });

      return channel;
    } catch (error) {
      console.error('WebSocket setup failed:', error);
      setConnectionError(true);
      return null;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Today";
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short", 
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchConversations = async () => {
    if (!user || isVerified !== true) return;

    try {
      setLoading(true);
      
      const { data: conversationsData, error: conversationsError } = await supabase
        .from("messages")
        .select("sender_id, recipient_id")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (conversationsError) {
        console.error('Error fetching conversation partners:', conversationsError);
        throw conversationsError;
      }

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const contactIds = new Set<string>();
      conversationsData.forEach(msg => {
        if (msg.sender_id !== user.id) contactIds.add(msg.sender_id as string);
        if (msg.recipient_id !== user.id) contactIds.add(msg.recipient_id as string);
      });

      const uniqueContactIds: string[] = Array.from(contactIds);

      if (uniqueContactIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Fetch contact profiles - let RLS handle verification filtering
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, profile_image_url, is_verified")
        .in("id", uniqueContactIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      const conversationPromises = uniqueContactIds.map(async (contactId) => {
        const { data: lastMessage, error: messageError } = await supabase
          .from("messages")
          .select(`
            *,
            sender_profile:profiles!messages_sender_id_fkey(id, first_name, last_name, profile_image_url, is_verified)
          `)
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${user.id})`)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (messageError && messageError.code !== 'PGRST116') {
          console.error('Error fetching last message:', messageError);
        }

        const { count: unreadCount, error: countError } = await supabase
          .from("messages")
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', contactId)
          .eq('recipient_id', user.id)
          .is('read_at', null);

        if (countError) {
          console.error('Error counting unread messages:', countError);
        }

        const contact = profilesData?.find(p => p.id === contactId);
        if (!contact) return null;

        return {
          contact,
          lastMessage: lastMessage || null,
          unreadCount: unreadCount || 0
        };
      });

      const conversationResults = await Promise.all(conversationPromises);
      const validConversations = conversationResults.filter(conv => conv !== null) as Conversation[];
      
      validConversations.sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const dateB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return dateB - dateA;
      });

      setConversations(validConversations);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
      toast({
        title: "Error loading conversations",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    if (isVerified !== true) return;
    
    try {
      // Let RLS handle the verification filtering - just fetch all available contacts
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, profile_image_url, is_verified")
        .neq("id", user?.id || "")
        .order("first_name");

      if (error) {
        // If error is permission denied, user is not verified
        if (error.code === '42501') {
          console.log('User not verified, cannot fetch contacts');
          setContacts([]);
          return;
        }
        throw error;
      }

      if (data) {
        setContacts(data as ContactProfile[]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    }
  };

  const fetchConversationMessages = async (contactId: string) => {
    if (!user || isVerified !== true) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(id, first_name, last_name, profile_image_url, is_verified)
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (data && !error) {
        setConversationMessages(data as ConversationMessage[]);
        
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("sender_id", contactId)
          .eq("recipient_id", user.id)
          .is("read_at", null);
          
        setConversations(prev => prev.map(conv => 
          conv.contact.id === contactId ? {...conv, unreadCount: 0} : conv
        ));
      }
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    
    const validFiles = newFiles.filter(file => {
      if (type === 'image') {
        return file.type.startsWith('image/');
      } else {
        return file.type.startsWith('video/');
      }
    });

    if (validFiles.length === 0) {
      toast({
        title: "Invalid File",
        description: `Please select a valid ${type} file.`,
        variant: "destructive",
      });
      return;
    }

    const oversizedFiles = validFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Too Large",
        description: "Please select files smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedMessageImages(prev => [...prev, ...validFiles]);
    setShowMediaOptions(false);
    e.target.value = '';
  };

  const removeSelectedFile = (index: number) => {
    setSelectedMessageImages(prev => prev.filter((_, i) => i !== index));
  };

  const openMediaGallery = (media: string[], index: number = 0) => {
    setSelectedMedia(media);
    setInitialMediaIndex(index);
    setMediaGalleryOpen(true);
  };

  const sendMessage = async () => {
    if (!user || !activeConversation || (!newMessage.trim() && selectedMessageImages.length === 0)) return;

    // Client-side verification check
    if (isVerified !== true) {
      toast({
        title: "Account Not Approved",
        description: "Your account needs admin approval to send messages.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      let imageUrls: string[] = [];
      
      if (selectedMessageImages.length > 0) {
        try {
          for (const image of selectedMessageImages) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('message-images')
              .upload(fileName, image);

            if (uploadError) {
              console.error("Upload error:", uploadError);
              throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
              .from('message-images')
              .getPublicUrl(fileName);

            imageUrls.push(publicUrl);
          }
        } catch (error) {
          console.log("Error: ", error);
          toast({
            title: "Media Error",
            description: "Failed to upload media. Please try again.",
            variant: "destructive",
          });
          setSending(false);
          return;
        }
      }

      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          recipient_id: activeConversation,
          content: newMessage.trim(),
          images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
          subject: null
        });

      if (error) {
        if (error.code === '42501') {
          toast({
            title: "Account Not Approved",
            description: "Your account needs admin approval to send messages.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setNewMessage("");
      setSelectedMessageImages([]);
      fetchConversationMessages(activeConversation);
      fetchConversations();
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const startNewChat = (contactId: string) => {
    setActiveConversation(contactId);
    setShowNewChat(false);
    setShowConversationList(false);
    fetchConversationMessages(contactId);
  };

  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConversations = conversations.filter(conv =>
    `${conv.contact.first_name} ${conv.contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackToConversations = () => {
    setShowConversationList(true);
    setActiveConversation(null);
  };

  const retryConnection = () => {
    setConnectionError(false);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setupRealtimeSubscription();
    fetchConversations();
    if (activeConversation) {
      fetchConversationMessages(activeConversation);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h1>
          <p className="text-gray-600">Please sign in to access your messages.</p>
        </div>
      </div>
    );
  }

  // Show loading while checking verification
  if (verificationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking account status...</p>
        </div>
      </div>
    );
  }

  // Show admin approval required for unverified users
  if (isVerified === false) {
    return <AdminApprovalRequired />;
  }

  // Show loading while fetching messages
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Return the main messaging interface for verified users
  return (
    <div className="min-h-screen bg-gray-50">
      

      <div className="h-screen flex flex-col md:flex-row">
        {/* Left Panel - Conversations */}
        <div className={`${showConversationList ? 'flex' : 'hidden md:flex'} md:w-1/3 bg-white border-r border-gray-200 flex-col w-full h-full`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                Messages
              </h1>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="md:hidden"
                >
                  <Menu className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowNewChat(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline ml-1">New</span>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {showNewChat ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Start New Chat</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewChat(false)}
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-2">
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No contacts available</p>
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => startNewChat(contact.id)}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={contact.profile_image_url || ""} />
                          <AvatarFallback>
                            {contact.first_name[0]}{contact.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {contact.first_name} {contact.last_name}
                            </p>
                            {contact.is_verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <Button 
                      onClick={() => setShowNewChat(true)}
                      className="mt-2 bg-green-600 hover:bg-green-700"
                    >
                      Start a conversation
                    </Button>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.contact.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        activeConversation === conversation.contact.id ? 'bg-green-50' : ''
                      }`}
                      onClick={() => {
                        setActiveConversation(conversation.contact.id);
                        fetchConversationMessages(conversation.contact.id);
                        setShowConversationList(false);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarImage src={conversation.contact.profile_image_url || ""} />
                          <AvatarFallback>
                            {conversation.contact.first_name[0]}{conversation.contact.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.contact.first_name} {conversation.contact.last_name}
                            </p>
                            {conversation.lastMessage && (
                              <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {formatMessageDate(conversation.lastMessage.created_at)}
                              </p>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage.sender_id === user.id ? (
                                  <span className="text-green-600">✓ </span>
                                ) : ''}
                                {conversation.lastMessage.sender_id === user.id ? 'You: ' : ''}
                                {conversation.lastMessage.content}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-green-600 text-xs h-5 w-5 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Panel - Active Chat */}
        <div className={`${showConversationList ? 'hidden md:flex' : 'flex'} flex-1 flex-col w-full h-full`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-green-600 text-white p-3 flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden text-white hover:bg-green-700 mr-2"
                  onClick={handleBackToConversations}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                {(() => {
                  const contact = conversations.find(c => c.contact.id === activeConversation)?.contact ||
                                contacts.find(c => c.id === activeConversation);
                  return contact ? (
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar className="w-8 h-8 border border-white">
                        <AvatarImage src={contact.profile_image_url || ""} />
                        <AvatarFallback className="bg-green-700 text-white">
                          {contact.first_name[0]}{contact.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-medium truncate">
                          {contact.first_name} {contact.last_name}
                        </h2>
                        {contact.is_verified && (
                          <span className="text-xs text-green-100">
                            Verified Student
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}
                <Button variant="ghost" size="sm" className="text-white hover:bg-green-700">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 bg-green-50 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {conversationMessages.map((message, index) => {
                    const isFromMe = message.sender_id === user.id;
                    const showDate = index === 0 || 
                      formatMessageDate(message.created_at) !== 
                      formatMessageDate(conversationMessages[index - 1].created_at);
                    
                    const messageImages = message.images ? JSON.parse(message.images) : [];
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <div className="bg-green-200 text-green-800 text-xs px-3 py-1 rounded-full">
                              {formatMessageDate(message.created_at)}
                            </div>
                          </div>
                        )}
                        <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isFromMe
                                ? 'bg-green-100 text-gray-900'
                                : 'bg-white text-gray-900 shadow-sm'
                            }`}
                          >
                            {messageImages.length > 0 && (
                              <div className={`mb-2 grid gap-1 ${messageImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {messageImages.slice(0, 4).map((img: string, idx: number) => (
                                  <div 
                                    key={idx} 
                                    className={`relative cursor-pointer ${messageImages.length > 1 && idx === 3 ? 'bg-black/40' : ''}`}
                                    onClick={() => openMediaGallery(messageImages, idx)}
                                  >
                                    {img.endsWith('.mp4') || img.endsWith('.mov') || img.endsWith('.webm') ? (
                                      <div className="relative">
                                        <video 
                                          src={img} 
                                          className="w-full h-auto rounded-md"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <Play className="h-8 w-8 text-white/80" fill="white" />
                                        </div>
                                      </div>
                                    ) : (
                                      <img 
                                        src={img} 
                                        alt={`Attachment ${idx + 1}`} 
                                        className="w-full h-auto rounded-md"
                                      />
                                    )}
                                    {messageImages.length > 4 && idx === 3 && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                                        <span className="text-white text-lg font-bold">
                                          +{messageImages.length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {message.content && (
                              <p className="text-sm">{message.content}</p>
                            )}
                            <p className={`text-xs mt-1 text-right ${
                              isFromMe ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Selected Media Preview */}
              {selectedMessageImages.length > 0 && (
                <div className="bg-white border-t border-gray-200 p-3">
                  <div className="flex overflow-x-auto space-x-2 pb-2">
                    {selectedMessageImages.map((file, index) => (
                      <div key={index} className="relative flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="relative h-16 w-16">
                            <video className="h-16 w-16 object-cover rounded-md">
                              <source src={URL.createObjectURL(file)} type={file.type} />
                            </video>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-6 w-6 text-white/80" fill="white" />
                            </div>
                          </div>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full"
                          onClick={() => removeSelectedFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-3 relative">
                <div className="flex items-center space-x-2">
                  {/* Media attachment button */}
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full text-gray-500 hover:text-green-600"
                      onClick={() => {
                        setShowMediaOptions(!showMediaOptions);
                        setShowEmojiPicker(false);
                      }}
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>

                    {showMediaOptions && (
                      <div className="absolute bottom-12 left-0 bg-white shadow-lg rounded-lg p-2 flex space-x-2 z-10 border border-gray-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Image className="h-6 w-6 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-full"
                          onClick={() => videoInputRef.current?.click()}
                        >
                          <Video className="h-6 w-6 text-green-600" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e, 'image')}
                  />
                  <input
                    type="file"
                    ref={videoInputRef}
                    className="hidden"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileSelect(e, 'video')}
                  />

                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="rounded-full pr-10"
                    />
                    
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 right--1 z-20">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          width={300}
                          height={300}
                          previewConfig={{ showPreview: false }}
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full text-gray-500 hover:text-green-600"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowMediaOptions(false);
                    }}
                  >
                    <Smile className="h-5 w-5" />
                  </Button>

                  <Button
                    onClick={sendMessage}
                    disabled={sending || (!newMessage.trim() && selectedMessageImages.length === 0)}
                    className="bg-green-600 hover:bg-green-700 rounded-full h-10 w-10 p-0"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                <p className="text-gray-600">
                  Choose a conversation from the sidebar or start a new chat
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Gallery Modal */}
      <MediaGallery 
        media={selectedMedia} 
        isOpen={mediaGalleryOpen} 
        onClose={() => setMediaGalleryOpen(false)} 
        initialIndex={initialMediaIndex}
      />
    </div>
  );
}