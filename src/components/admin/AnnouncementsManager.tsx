import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
    Plus,
    FileText,
    Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

export function AnnouncementsManager() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        category: 'general',
        featured: false,
        published: true
    });
    const [selectedAnnouncementImages, setSelectedAnnouncementImages] = useState<File[]>([]);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

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

    const handleAnnouncementSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            let imageUrls: string[] = [];

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
                }
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

    return (
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
                                        // fall through
                                    }
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
}
