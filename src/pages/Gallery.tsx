import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Search, X, ZoomIn, Image as ImageIcon, Copy } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

// Manual type definition to bypass missing generated types
interface GalleryItem {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    event_date: string | null;
    is_featured: boolean | null;
    image_url: string;
    created_at: string;
    updated_at: string;
}

import { useSearchParams } from "react-router-dom";

export default function Gallery() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // Fetch items sync with URL
    useEffect(() => {
        fetchGalleryItems();
    }, []);

    // Sync URL param with selected image
    useEffect(() => {
        const imageId = searchParams.get("id");
        if (imageId && items.length > 0 && !selectedImage) {
            const image = items.find(item => item.id === imageId);
            if (image) {
                setSelectedImage(image);
            }
        }
    }, [items, searchParams]);

    const handleImageSelect = (item: GalleryItem) => {
        setSelectedImage(item);
        setSearchParams({ id: item.id });
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
        searchParams.delete("id");
        setSearchParams(searchParams);
    };

    const fetchGalleryItems = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("gallery_items" as any)
                .select("*")
                .order("event_date", { ascending: false });

            if (error) throw error;
            setItems((data as any) || []);
        } catch (error) {
            console.error("Error fetching gallery items:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ["All", ...Array.from(new Set(items.map(item => item.category || "General"))).sort()];

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        const matchesSearch =
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <LoadingSpinner size="md" className="mb-4" />
                    <p className="text-muted-foreground">Loading gallery...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <Badge variant="secondary" className="mb-2">Our Memories</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
                        NUGSA Gallery
                    </h1>
                    <p className="text-xl text-muted-foreground font-light">
                        Capturing the moments that define our community, from cultural celebrations to academic achievements.
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border">
                    <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory}>
                            <TabsList className="bg-muted/50">
                                {categories.map(category => (
                                    <TabsTrigger key={category} value={category} className="px-4">
                                        {category}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search memories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Gallery Grid */}
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
                                onClick={() => handleImageSelect(item)}
                            >
                                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <Button variant="secondary" size="sm" className="gap-2">
                                            <ZoomIn className="w-4 h-4" /> View
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {item.category}
                                        </Badge>
                                        {item.event_date && (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(item.event_date)}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No photos found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                        <Button variant="link" onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}>
                            Clear filters
                        </Button>
                    </div>
                )}

                {/* Image Modal */}
                {/* Image Modal */}
                <Dialog open={!!selectedImage} onOpenChange={(open) => !open && handleCloseModal()}>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none md:max-h-[85vh]">
                        <div className="relative bg-black rounded-lg overflow-hidden flex flex-col md:flex-row h-full max-h-[80vh] md:max-h-[85vh]">
                            {/* Image Container */}
                            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
                                {selectedImage && (
                                    <img
                                        src={selectedImage.image_url}
                                        alt={selectedImage.title}
                                        className="w-full h-full object-contain max-h-[85vh]"
                                    />
                                )}
                            </div>

                            {/* Sidebar Info (Desktop) / Bottom Info (Mobile) */}
                            <div className="w-full md:w-80 bg-white p-6 md:h-full overflow-y-auto flex-shrink-0">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge>{selectedImage?.category}</Badge>
                                            <button
                                                onClick={handleCloseModal}
                                                className="md:hidden text-muted-foreground hover:text-foreground p-1"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground mb-2">
                                            {selectedImage?.title}
                                        </h2>
                                        {selectedImage?.event_date && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(selectedImage.event_date)}
                                            </p>
                                        )}
                                    </div>

                                    {selectedImage?.description && (
                                        <div className="prose prose-sm text-muted-foreground">
                                            <p>{selectedImage.description}</p>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                                            Share
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full gap-2"
                                                onClick={() => {
                                                    if (selectedImage) {
                                                        const shareUrl = `${window.location.origin}/gallery?id=${selectedImage.id}`;
                                                        navigator.clipboard.writeText(shareUrl);
                                                        toast({
                                                            title: "Copied!",
                                                            description: "Link copied to clipboard",
                                                        });
                                                    }
                                                }}
                                            >
                                                <Copy className="w-4 h-4" />
                                                Copy Link
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Close Button (Desktop) */}
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-sm hidden md:block transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
