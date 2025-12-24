import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
    MapPin,
    Users,
    Calendar,
    Mail,
    Phone,
    ChevronDown,
    ChevronUp,
    Building2,
    Sparkles,
    Award,
    Clock,
    Search
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface Chapter {
    id: string;
    name: string;
    city: string;
    region: string;
    description: string | null;
    member_count: number | null;
    meeting_schedule: string | null;
    established_date: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    logo_url: string | null;
    cover_image_url: string | null;
    is_active: boolean | null;
}

interface ChapterLeader {
    id: string;
    chapter_id: string;
    name: string;
    position: string;
    image_url: string | null;
    bio: string | null;
    email: string | null;
    phone: string | null;
    order_priority: number;
    is_active: boolean;
}

interface ChapterActivity {
    id: string;
    chapter_id: string;
    title: string;
    description: string | null;
    date: string;
    location: string | null;
    image_url: string | null;
    category: string | null;
    attendees_count: number | null;
}

interface ChapterWithDetails extends Chapter {
    leaders: ChapterLeader[];
    activities: ChapterActivity[];
}

export default function Chapters() {
    const [chapters, setChapters] = useState<ChapterWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [regionFilter, setRegionFilter] = useState<string>("all");
    const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
    const { t } = useTranslation('chapters');

    useEffect(() => {
        fetchChapters();
    }, []);

    const fetchChapters = async () => {
        try {
            setLoading(true);

            // Fetch chapters
            const { data: chaptersData, error: chaptersError } = await supabase
                .from("chapters" as any)
                .select("*")
                .eq("is_active", true)
                .order("city", { ascending: true });

            if (chaptersError) throw chaptersError;

            // Fetch leaders and activities for each chapter
            const chaptersWithDetails = await Promise.all(
                ((chaptersData as unknown as Chapter[]) || []).map(async (chapter) => {
                    const [leadersResponse, activitiesResponse] = await Promise.all([
                        supabase
                            .from("chapter_leaders" as any)
                            .select("*")
                            .eq("chapter_id", chapter.id)
                            .eq("is_active", true)
                            .order("order_priority", { ascending: true }),
                        supabase
                            .from("chapter_activities" as any)
                            .select("*")
                            .eq("chapter_id", chapter.id)
                            .order("date", { ascending: false })
                            .limit(5)
                    ]);

                    return {
                        ...chapter,
                        leaders: (leadersResponse.data as unknown as ChapterLeader[]) || [],
                        activities: (activitiesResponse.data as unknown as ChapterActivity[]) || []
                    };
                })
            );

            setChapters(chaptersWithDetails);
        } catch (error) {
            console.error("Error fetching chapters:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleChapterExpansion = (chapterId: string) => {
        setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
    };

    const filteredChapters = chapters.filter((chapter) => {
        const matchesSearch =
            chapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chapter.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chapter.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRegion = regionFilter === "all" || chapter.region === regionFilter;

        return matchesSearch && matchesRegion;
    });

    const uniqueRegions = Array.from(new Set(chapters.map(c => c.region))).sort();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            "Cultural": "bg-purple-100 text-purple-700 border-purple-200",
            "Academic": "bg-blue-100 text-blue-700 border-blue-200",
            "Professional": "bg-green-100 text-green-700 border-green-200",
            "Community Service": "bg-orange-100 text-orange-700 border-orange-200",
            "Social": "bg-pink-100 text-pink-700 border-pink-200",
            "General": "bg-gray-100 text-gray-700 border-gray-200"
        };
        return colors[category] || colors["General"];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
                <div className="text-center">
                    <LoadingSpinner size="md" className="mb-4" />
                    <p className="text-muted-foreground">Loading chapters...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 space-y-12">
                {/* Hero Section */}
                <section className="space-y-6">
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                                <Building2 className="w-16 h-16 text-primary relative z-10" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
                            {t('title')}
                        </h1>
                        <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50/50">
                            <CardContent className="p-6 text-center">
                                <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
                                <p className="text-3xl font-bold text-primary">{chapters.length}</p>
                                <p className="text-sm text-muted-foreground">Active Chapters</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-green-50/50">
                            <CardContent className="p-6 text-center">
                                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <p className="text-3xl font-bold text-green-600">
                                    {chapters.reduce((sum, c) => sum + (c.member_count || 0), 0)}+
                                </p>
                                <p className="text-sm text-muted-foreground">Total Members</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-purple-50/50">
                            <CardContent className="p-6 text-center">
                                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <p className="text-3xl font-bold text-purple-600">
                                    {chapters.reduce((sum, c) => sum + c.activities.length, 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Recent Activities</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Search and Filter Section */}
                <section className="space-y-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search chapters by name, city, or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={regionFilter} onValueChange={setRegionFilter}>
                                    <SelectTrigger className="w-full md:w-64">
                                        <SelectValue placeholder="Filter by region" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Regions</SelectItem>
                                        {uniqueRegions.map((region) => (
                                            <SelectItem key={region} value={region}>
                                                {region}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Chapters Grid */}
                <section className="space-y-6">
                    {filteredChapters.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredChapters.map((chapter) => {
                                const isExpanded = expandedChapter === chapter.id;

                                return (
                                    <Card
                                        key={chapter.id}
                                        className="group hover:shadow-xl transition-all duration-300 border-primary/10 hover:border-primary/30 overflow-hidden"
                                    >
                                        {/* Chapter Header */}
                                        <div className="relative h-32 bg-gradient-to-r from-primary to-primary/80 overflow-hidden">
                                            {chapter.cover_image_url ? (
                                                <img
                                                    src={chapter.cover_image_url}
                                                    alt={chapter.name}
                                                    className="w-full h-full object-cover opacity-30"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
                                            )}
                                            <div className="absolute bottom-4 left-6 flex items-center gap-4">
                                                {chapter.logo_url ? (
                                                    <img
                                                        src={chapter.logo_url}
                                                        alt={`${chapter.name} logo`}
                                                        className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-white"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                                                        <Building2 className="w-8 h-8 text-primary" />
                                                    </div>
                                                )}
                                                <div className="text-white">
                                                    <h3 className="text-2xl font-bold">{chapter.name}</h3>
                                                    <p className="text-sm opacity-90 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {chapter.city}, {chapter.region}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <CardContent className="p-6 space-y-4">
                                            {/* Chapter Info */}
                                            <div className="space-y-3">
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {chapter.description}
                                                </p>

                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    {chapter.member_count && (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Users className="w-4 h-4" />
                                                            <span>{chapter.member_count} members</span>
                                                        </div>
                                                    )}
                                                    {chapter.established_date && (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>Est. {new Date(chapter.established_date).getFullYear()}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {chapter.meeting_schedule && (
                                                    <div className="flex items-start gap-2 text-sm bg-blue-50 p-3 rounded-lg">
                                                        <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="font-semibold text-blue-900">Meeting Schedule</p>
                                                            <p className="text-blue-700">{chapter.meeting_schedule}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Leaders Preview */}
                                            {chapter.leaders.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-semibold text-foreground">Chapter Executives</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex -space-x-2">
                                                            {chapter.leaders.slice(0, 4).map((leader) => (
                                                                <Avatar key={leader.id} className="border-2 border-white w-10 h-10">
                                                                    <AvatarImage src={leader.image_url || undefined} />
                                                                    <AvatarFallback className="bg-primary text-white text-xs">
                                                                        {leader.name.split(' ').map(n => n[0]).join('')}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ))}
                                                        </div>
                                                        {chapter.leaders.length > 4 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                +{chapter.leaders.length - 4} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Contact Info */}
                                            <div className="flex flex-wrap gap-3">
                                                {chapter.contact_email && (
                                                    <a
                                                        href={`mailto:${chapter.contact_email}`}
                                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                                    >
                                                        <Mail className="w-3 h-3" />
                                                        {chapter.contact_email}
                                                    </a>
                                                )}
                                                {chapter.contact_phone && (
                                                    <a
                                                        href={`tel:${chapter.contact_phone}`}
                                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        {chapter.contact_phone}
                                                    </a>
                                                )}
                                            </div>

                                            <Separator />

                                            {/* Expand/Collapse Button */}
                                            <Button
                                                variant="ghost"
                                                onClick={() => toggleChapterExpansion(chapter.id)}
                                                className="w-full"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp className="w-4 h-4 mr-2" />
                                                        Show Less
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="w-4 h-4 mr-2" />
                                                        View Executives & Activities
                                                    </>
                                                )}
                                            </Button>

                                            {/* Expanded Content */}
                                            {isExpanded && (
                                                <div className="space-y-6 pt-4 border-t">
                                                    {/* Leaders Detail */}
                                                    {chapter.leaders.length > 0 && (
                                                        <div className="space-y-3">
                                                            <h4 className="font-semibold flex items-center gap-2">
                                                                <Award className="w-4 h-4 text-primary" />
                                                                Executive Team
                                                            </h4>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {chapter.leaders.map((leader) => (
                                                                    <Card key={leader.id} className="border">
                                                                        <CardContent className="p-4">
                                                                            <div className="flex items-start gap-3">
                                                                                <Avatar className="w-12 h-12">
                                                                                    <AvatarImage src={leader.image_url || undefined} />
                                                                                    <AvatarFallback className="bg-primary text-white">
                                                                                        {leader.name.split(' ').map(n => n[0]).join('')}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-semibold text-sm">{leader.name}</p>
                                                                                    <Badge variant="secondary" className="text-xs mb-2">
                                                                                        {leader.position}
                                                                                    </Badge>
                                                                                    {leader.bio && (
                                                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                                                            {leader.bio}
                                                                                        </p>
                                                                                    )}
                                                                                    {leader.email && (
                                                                                        <a
                                                                                            href={`mailto:${leader.email}`}
                                                                                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                                                                        >
                                                                                            <Mail className="w-3 h-3" />
                                                                                            Contact
                                                                                        </a>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Empty State */}
                                                    {chapter.leaders.length === 0 && chapter.activities.length === 0 && (
                                                        <div className="text-center py-6 text-muted-foreground">
                                                            <p>No additional details available for this chapter yet.</p>
                                                        </div>
                                                    )}

                                                    {/* Activities */}
                                                    {chapter.activities.length > 0 && (
                                                        <div className="space-y-3">
                                                            <h4 className="font-semibold flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-primary" />
                                                                Recent Activities
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {chapter.activities.map((activity) => (
                                                                    <Card key={activity.id} className="border">
                                                                        <CardContent className="p-4">
                                                                            <div className="flex items-start justify-between gap-3">
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-start gap-2 mb-2">
                                                                                        <h5 className="font-semibold text-sm flex-1">
                                                                                            {activity.title}
                                                                                        </h5>
                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            className={`text-xs ${getCategoryColor(activity.category || 'General')}`}
                                                                                        >
                                                                                            {activity.category}
                                                                                        </Badge>
                                                                                    </div>
                                                                                    {activity.description && (
                                                                                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                                                                            {activity.description}
                                                                                        </p>
                                                                                    )}
                                                                                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                                                        <span className="flex items-center gap-1">
                                                                                            <Calendar className="w-3 h-3" />
                                                                                            {formatDate(activity.date)}
                                                                                        </span>
                                                                                        {activity.location && (
                                                                                            <span className="flex items-center gap-1">
                                                                                                <MapPin className="w-3 h-3" />
                                                                                                {activity.location}
                                                                                            </span>
                                                                                        )}
                                                                                        {activity.attendees_count && (
                                                                                            <span className="flex items-center gap-1">
                                                                                                <Users className="w-3 h-3" />
                                                                                                {activity.attendees_count} attendees
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">No chapters found</h3>
                                <p className="text-muted-foreground">
                                    Try adjusting your search or filter criteria
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Call to Action */}
                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 md:p-12 text-center space-y-6 shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.png')] opacity-10"></div>
                    <div className="relative z-10 space-y-4">
                        <Sparkles className="w-12 h-12 mx-auto text-yellow-300 animate-pulse" />
                        <h2 className="text-2xl md:text-3xl font-bold">
                            Want to Start a Chapter in Your City?
                        </h2>
                        <p className="text-lg opacity-90 max-w-2xl mx-auto">
                            We're always looking to expand our presence across Germany. If you're interested in starting a NUGSA chapter in your city, we'd love to hear from you!
                        </p>
                        <Button
                            size="lg"
                            variant="secondary"
                            className="bg-white text-primary hover:bg-white/90 font-semibold"
                            onClick={() => window.location.href = '/contact'}
                        >
                            Get in Touch
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
}
