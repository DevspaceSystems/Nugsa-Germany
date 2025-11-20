import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface HeroImage {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  order_priority: number;
  created_at: string;
  updated_at: string;
}

export function HeroSlideshowManager() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageTitle, setImageTitle] = useState("");

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_images" as any)
        .select("*")
        .order("order_priority", { ascending: true });

      if (error) throw error;
      setHeroImages((data as any) || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load hero images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !imageTitle) {
      toast({
        title: "Error",
        description: "Please select an image and provide a title",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hero-images')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("hero_images" as any)
        .insert({
          title: imageTitle,
          image_url: publicUrl,
          is_active: true,
          order_priority: heroImages.length + 1
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Hero image uploaded successfully!",
      });

      setSelectedFile(null);
      setImageTitle("");
      fetchHeroImages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload hero image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleImageStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("hero_images" as any)
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Image ${isActive ? 'activated' : 'deactivated'} successfully`,
      });

      fetchHeroImages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update image status",
        variant: "destructive",
      });
    }
  };

  const deleteImage = async (id: string, imageUrl: string) => {
    try {
      // Extract filename from URL
      const fileName = imageUrl.split('/').pop();
      
      // Delete from storage
      if (fileName) {
        await supabase.storage
          .from('hero-images')
          .remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase
        .from("hero_images" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hero image deleted successfully",
      });

      fetchHeroImages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete hero image",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hero Slideshow Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Slideshow Manager</CardTitle>
        <CardDescription>
          Manage hero section background images for the homepage slideshow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Form */}
        <form onSubmit={handleImageUpload} className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold">Upload New Hero Image</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hero-title">Image Title</Label>
              <Input
                id="hero-title"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                placeholder="Enter image title"
                required
              />
            </div>
            <div>
              <Label htmlFor="hero-image">Select Image</Label>
              <Input
                id="hero-image"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
        </form>

        {/* Images List */}
        <div className="space-y-4">
          <h3 className="font-semibold">Current Hero Images</h3>
          {heroImages.length === 0 ? (
            <p className="text-muted-foreground">No hero images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {heroImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">{image.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={image.is_active}
                          onCheckedChange={(checked) => toggleImageStatus(image.id, checked)}
                        />
                        <span className="text-sm">
                          {image.is_active ? (
                            <span className="flex items-center text-green-600">
                              <Eye className="w-4 h-4 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center text-gray-500">
                              <EyeOff className="w-4 h-4 mr-1" />
                              Inactive
                            </span>
                          )}
                        </span>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Hero Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{image.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteImage(image.id, image.image_url)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}