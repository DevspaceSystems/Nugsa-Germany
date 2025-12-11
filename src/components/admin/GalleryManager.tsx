import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Trash2, Plus, Upload, Image as ImageIcon, Calendar } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

// Manual type definition to bypass missing generated types
type GalleryItem = {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    event_date: string | null;
    is_featured: boolean | null;
    image_url: string;
    created_at: string;
    updated_at: string;
};

interface GalleryManagerProps {
    onUpdate?: () => void;
}

export function GalleryManager({ onUpdate }: GalleryManagerProps) {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        title: "",
        description: "",
        category: "Events",
        event_date: new Date().toISOString().split("T")[0],
        is_featured: false
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("gallery_items" as any)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setItems(data as any || []);
        } catch (error) {
            console.error("Error fetching gallery items:", error);
            toast({
                title: "Error",
                description: "Failed to load gallery items",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast({
                title: "Required",
                description: "Please select an image to upload",
                variant: "destructive"
            });
            return;
        }

        setUploading(true);
        try {
            // 1. Upload Image
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `gallery-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(fileName, selectedFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(fileName);

            // 2. Insert Record
            const { error: insertError } = await supabase
                .from('gallery_items' as any)
                .insert({
                    title: newItem.title,
                    description: newItem.description,
                    category: newItem.category,
                    event_date: newItem.event_date,
                    is_featured: newItem.is_featured,
                    image_url: publicUrl
                });

            if (insertError) throw insertError;

            toast({
                title: "Success",
                description: "Photo added to gallery successfully"
            });

            // Reset Form
            setNewItem({
                title: "",
                description: "",
                category: "Events",
                event_date: new Date().toISOString().split("T")[0],
                is_featured: false
            });
            setSelectedFile(null);

            // Refresh list
            fetchItems();
            if (onUpdate) onUpdate();

        } catch (error) {
            console.error("Error adding gallery item:", error);
            toast({
                title: "Error",
                description: "Failed to add photo to gallery",
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, imageUrl: string) => {
        if (!confirm("Are you sure you want to delete this photo?")) return;

        try {
            // 1. Delete Record
            const { error: deleteError } = await supabase
                .from('gallery_items' as any)
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            // 2. Delete Image from Storage (optional but good practice)
            // Extract filename from URL
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];

            if (fileName) {
                await supabase.storage
                    .from('gallery')
                    .remove([fileName]);
            }

            toast({
                title: "Success",
                description: "Photo deleted successfully"
            });

            fetchItems();
            if (onUpdate) onUpdate();

        } catch (error) {
            console.error("Error deleting gallery item:", error);
            toast({
                title: "Error",
                description: "Failed to delete photo",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Add New Item Form */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Add New Photo
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={newItem.title}
                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                placeholder="e.g., Independence Day Celebration"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={newItem.category}
                                onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Events">Events</SelectItem>
                                    <SelectItem value="Meetings">Meetings</SelectItem>
                                    <SelectItem value="Community">Community</SelectItem>
                                    <SelectItem value="Social">Social</SelectItem>
                                    <SelectItem value="Academic">Academic</SelectItem>
                                    <SelectItem value="Cultural">Cultural</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="event_date">Event Date</Label>
                            <Input
                                id="event_date"
                                type="date"
                                value={newItem.event_date}
                                onChange={(e) => setNewItem({ ...newItem, event_date: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Photo</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="Brief description of the event..."
                            rows={2}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="featured"
                                checked={newItem.is_featured!}
                                onCheckedChange={(checked) => setNewItem({ ...newItem, is_featured: checked })}
                            />
                            <Label htmlFor="featured">Featured (Show first)</Label>
                        </div>

                        <Button type="submit" disabled={uploading} className="w-full md:w-auto">
                            {uploading ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Photo
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Gallery List */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-primary" />
                        Gallery Items
                    </h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <LoadingSpinner size="md" className="mb-2" />
                        <p className="text-muted-foreground">Loading items...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Featured</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No photos found. Upload one above!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.category}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-muted-foreground text-sm">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(item.event_date || "").toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.is_featured ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Featured</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(item.id, item.image_url)}
                                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
