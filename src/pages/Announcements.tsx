import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Calendar, Star, Filter, Search, Clock, Tag, TrendingUp, X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Announcement = Tables<"announcements">;

type MediaItem = {
  url: string;
  type: 'image' | 'video';
};

// Facebook-like media gallery component
const MediaGallery = ({ media, title }: { media: MediaItem[]; title: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const currentMedia = media[currentIndex];

  const nextMedia = () => {
    // Pause current video if playing
    if (currentMedia.type === 'video' && videoRefs.current[currentIndex]) {
      videoRefs.current[currentIndex]?.pause();
    }
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setIsPlaying(false);
  };

  const prevMedia = () => {
    // Pause current video if playing
    if (currentMedia.type === 'video' && videoRefs.current[currentIndex]) {
      videoRefs.current[currentIndex]?.pause();
    }
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (currentMedia.type === 'video' && videoRefs.current[currentIndex]) {
      const video = videoRefs.current[currentIndex];
      if (video) {
        if (video.paused) {
          video.play();
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      }
    }
  };

  const toggleMute = () => {
    if (currentMedia.type === 'video' && videoRefs.current[currentIndex]) {
      const video = videoRefs.current[currentIndex];
      if (video) {
        video.muted = !video.muted;
        setIsMuted(video.muted);
      }
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  if (media.length === 0) return null;

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {/* Fixed size container - Facebook post like */}
      <div className="w-full h-96 bg-black flex items-center justify-center relative">
        {currentMedia.type === 'image' ? (
          <img
            src={currentMedia.url}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            ref={el => videoRefs.current[currentIndex] = el}
            src={currentMedia.url}
            className="max-w-full max-h-full object-contain"
            muted={isMuted}
            onEnded={handleVideoEnd}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            playsInline
          />
        )}
        
        {/* Video controls */}
        {currentMedia.type === 'video' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Play button overlay for videos */}
        {currentMedia.type === 'video' && !isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlayPause}
          >
            <div className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors">
              <Play className="w-12 h-12 text-white" />
            </div>
          </div>
        )}
        
        {/* Navigation buttons */}
        {media.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8"
              onClick={prevMedia}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8"
              onClick={nextMedia}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
        
        {/* Media counter */}
        {media.length > 1 && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
            {currentIndex + 1} / {media.length}
          </div>
        )}

        {/* Media type indicator */}
        <div className="absolute top-2 right-2">
          {currentMedia.type === 'video' && (
            <Badge variant="secondary" className="bg-black/50 text-white border-0">
              VIDEO
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMediaIndex, setDialogMediaIndex] = useState(0);
  const [isDialogPlaying, setIsDialogPlaying] = useState(false);
  const [isDialogMuted, setIsDialogMuted] = useState(true);
  const dialogVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, filterCategory, searchTerm]);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setAnnouncements(data);
    }
    setLoading(false);
  };

  const filterAnnouncements = () => {
    let filtered = announcements;

    if (filterCategory !== "all") {
      filtered = filtered.filter(announcement => announcement.category === filterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAnnouncements(filtered);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      scholarships: "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200",
      jobs: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200",
      sports: "bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 border-rose-200",
      events: "bg-gradient-to-r from-slate-100 to-stone-100 text-slate-700 border-slate-200",
      general: "bg-gradient-to-r from-gray-100 to-zinc-100 text-gray-800 border-gray-200"
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "scholarships":
        return "🎓";
      case "jobs":
        return "💼";
      case "sports":
        return "⚽";
      case "events":
        return "🎉";
      default:
        return "📢";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    }
  };

  const getAnnouncementMedia = (announcement: Announcement): MediaItem[] => {
    if (!announcement.image_url) return [];
    
    try {
      const mediaUrls = JSON.parse(announcement.image_url);
      if (Array.isArray(mediaUrls)) {
        return mediaUrls.map(url => ({
          url,
          type: url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) ? 'video' : 'image'
        }));
      }
    } catch {
      // Single media (legacy)
    }
    
    const url = announcement.image_url;
    return [{
      url,
      type: url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) ? 'video' : 'image'
    }];
  };

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDialogMediaIndex(0);
    setIsDialogPlaying(false);
    setIsDialogMuted(true);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    // Pause any playing video
    if (dialogVideoRef.current) {
      dialogVideoRef.current.pause();
    }
    setIsDialogOpen(false);
    setSelectedAnnouncement(null);
    setDialogMediaIndex(0);
    setIsDialogPlaying(false);
  };

  const nextDialogMedia = () => {
    if (!selectedAnnouncement) return;
    const media = getAnnouncementMedia(selectedAnnouncement);
    
    // Pause current video if playing
    if (dialogVideoRef.current) {
      dialogVideoRef.current.pause();
    }
    
    setDialogMediaIndex((prev) => (prev + 1) % media.length);
    setIsDialogPlaying(false);
  };

  const prevDialogMedia = () => {
    if (!selectedAnnouncement) return;
    const media = getAnnouncementMedia(selectedAnnouncement);
    
    // Pause current video if playing
    if (dialogVideoRef.current) {
      dialogVideoRef.current.pause();
    }
    
    setDialogMediaIndex((prev) => (prev - 1 + media.length) % media.length);
    setIsDialogPlaying(false);
  };

  const toggleDialogPlayPause = () => {
    if (dialogVideoRef.current) {
      const video = dialogVideoRef.current;
      if (video.paused) {
        video.play();
        setIsDialogPlaying(true);
      } else {
        video.pause();
        setIsDialogPlaying(false);
      }
    }
  };

  const toggleDialogMute = () => {
    if (dialogVideoRef.current) {
      const video = dialogVideoRef.current;
      video.muted = !video.muted;
      setIsDialogMuted(video.muted);
    }
  };

  const handleDialogVideoEnd = () => {
    setIsDialogPlaying(false);
  };

  const handleDialogVideoPlay = () => {
    setIsDialogPlaying(true);
  };

  const handleDialogVideoPause = () => {
    setIsDialogPlaying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    );
  }

  const featuredAnnouncements = filteredAnnouncements.filter(a => a.featured);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Bell className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            News & Announcements
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with the latest news, opportunities, and events from the NUGSA-Germany community
          </p>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="scholarships">🎓 Scholarships</SelectItem>
                    <SelectItem value="jobs">💼 Jobs</SelectItem>
                    <SelectItem value="sports">⚽ Sports</SelectItem>
                    <SelectItem value="events">🎉 Events</SelectItem>
                    <SelectItem value="general">📢 General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{filteredAnnouncements.length}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{featuredAnnouncements.length}</div>
              <div className="text-sm text-muted-foreground">Featured</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Tag className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {new Set(announcements.map(a => a.category)).size}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {announcements.filter(a => {
                  const date = new Date(a.created_at || "");
                  const now = new Date();
                  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                  return diffInDays <= 7;
                }).length}
              </div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Announcements */}
        {featuredAnnouncements.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
              <Star className="w-6 h-6 mr-2" />
              Featured Announcements
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredAnnouncements.map((announcement) => {
                const media = getAnnouncementMedia(announcement);
                
                return (
                  <Card 
                    key={announcement.id} 
                    className="group border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur overflow-hidden cursor-pointer"
                    onClick={() => handleAnnouncementClick(announcement)}
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-bl-lg">
                      <Star className="w-3 h-3 inline mr-1" />
                      Featured
                    </div>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={`${getCategoryColor(announcement.category)} border`}>
                          {getCategoryIcon(announcement.category)} {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(announcement.created_at || "")}
                        </div>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {announcement.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {media.length > 0 && (
                        <div className="mb-6">
                          <MediaGallery media={media} title={announcement.title} />
                        </div>
                      )}
                      <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {announcement.content.length > 300 
                            ? `${announcement.content.substring(0, 300)}...` 
                            : announcement.content}
                        </p>
                      </div>
                      
                      {announcement.content.length > 300 && (
                        <div className="mt-4">
                          <Button variant="outline" className="w-full">
                            Click to read more
                          </Button>
                        </div>
                      )}
                      
                      {announcement.category === "scholarships" && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800 font-medium flex items-center">
                            💡 <span className="ml-1">Tip: Check eligibility requirements and deadlines before applying.</span>
                          </p>
                        </div>
                      )}
                      
                      {announcement.category === "jobs" && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800 font-medium flex items-center">
                            💼 <span className="ml-1">Remember to update your resume and prepare for the application process.</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Regular Announcements */}
        <section>
          <h2 className="text-2xl font-bold text-primary mb-6">All Announcements</h2>
          <div className="space-y-6">
            {regularAnnouncements.map((announcement) => {
              const media = getAnnouncementMedia(announcement);
              
              return (
                <Card 
                  key={announcement.id} 
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur cursor-pointer"
                  onClick={() => handleAnnouncementClick(announcement)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge className={`${getCategoryColor(announcement.category)} border`}>
                            {getCategoryIcon(announcement.category)} {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(announcement.created_at || "")}
                          </div>
                        </div>
                        <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                          {announcement.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {media.length > 0 && (
                      <div className="mb-4">
                        <MediaGallery media={media} title={announcement.title} />
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {announcement.content.length > 300 
                          ? `${announcement.content.substring(0, 300)}...` 
                          : announcement.content}
                      </p>
                    </div>
                    
                    {announcement.content.length > 300 && (
                      <div className="mt-4">
                        <Button variant="outline" className="w-full">
                          Click to read more
                        </Button>
                      </div>
                    )}
                    
                    {announcement.category === "scholarships" && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium flex items-center">
                          💡 <span className="ml-1">Tip: Make sure to check eligibility requirements and deadlines before applying.</span>
                        </p>
                      </div>
                    )}
                    
                    {announcement.category === "jobs" && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium flex items-center">
                          💼 <span className="ml-1">Remember to update your resume and prepare for the application process.</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-6">
              <Bell className="w-20 h-20 mx-auto opacity-50" />
            </div>
            <h3 className="text-2xl font-medium text-muted-foreground mb-4">No announcements found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {filterCategory === "all" && !searchTerm
                ? "There are no announcements at the moment. Check back later!"
                : "No announcements match your current search and filter criteria. Try adjusting your filters."}
            </p>
          </div>
        )}
      </div>

      {/* Full Content Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  {selectedAnnouncement && (
                    <Badge className={`${getCategoryColor(selectedAnnouncement.category)} border`}>
                      {getCategoryIcon(selectedAnnouncement.category)} {selectedAnnouncement.category.charAt(0).toUpperCase() + selectedAnnouncement.category.slice(1)}
                    </Badge>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {selectedAnnouncement && formatDate(selectedAnnouncement.created_at || "")}
                  </div>
                  {selectedAnnouncement?.featured && (
                    <Badge className="bg-gradient-to-l from-yellow-400 to-orange-500 text-white">
                      <Star className="w-3 h-3 inline mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl mb-4">
                  {selectedAnnouncement?.title}
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseDialog}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <DialogDescription asChild>
            <div>
              {selectedAnnouncement && (() => {
                const media = getAnnouncementMedia(selectedAnnouncement);
                if (media.length === 0) return null;
                
                const currentMedia = media[dialogMediaIndex];
                
                return (
                  <div className="mb-6 relative bg-black rounded-lg overflow-hidden">
                    <div className="w-full h-96 bg-black flex items-center justify-center relative">
                      {currentMedia.type === 'image' ? (
                        <img
                          src={currentMedia.url}
                          alt={`${selectedAnnouncement.title} - Image ${dialogMediaIndex + 1}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <video
                          ref={dialogVideoRef}
                          src={currentMedia.url}
                          className="max-w-full max-h-full object-contain"
                          muted={isDialogMuted}
                          onEnded={handleDialogVideoEnd}
                          onPlay={handleDialogVideoPlay}
                          onPause={handleDialogVideoPause}
                          playsInline
                        />
                      )}
                      
                      {/* Video controls */}
                      {currentMedia.type === 'video' && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8"
                                onClick={toggleDialogPlayPause}
                              >
                                {isDialogPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8"
                                onClick={toggleDialogMute}
                              >
                                {isDialogMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Play button overlay for videos */}
                      {currentMedia.type === 'video' && !isDialogPlaying && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center cursor-pointer"
                          onClick={toggleDialogPlayPause}
                        >
                          <div className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      )}
                      
                      {/* Navigation buttons */}
                      {media.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8"
                            onClick={prevDialogMedia}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8"
                            onClick={nextDialogMedia}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      
                      {/* Media counter */}
                      {media.length > 1 && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                          {dialogMediaIndex + 1} / {media.length}
                        </div>
                      )}

                      {/* Media type indicator */}
                      <div className="absolute top-2 right-2">
                        {currentMedia.type === 'video' && (
                          <Badge variant="secondary" className="bg-black/50 text-white border-0">
                            VIDEO
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedAnnouncement?.content}
                </p>
              </div>
              
              {selectedAnnouncement?.category === "scholarships" && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium flex items-center">
                    💡 <span className="ml-1">Tip: Check eligibility requirements and deadlines before applying.</span>
                  </p>
                </div>
              )}
              
              {selectedAnnouncement?.category === "jobs" && (
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium flex items-center">
                    💼 <span className="ml-1">Remember to update your resume and prepare for the application process.</span>
                  </p>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}