import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { Building2, MapPin, Users, Edit, ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChapterExecutivesManager } from "./chapters/ChapterExecutivesManager";
import { ChapterActivitiesManager } from "./chapters/ChapterActivitiesManager";

interface ChapterManagerProps {
    managedChapterId?: string | null;
}

// Manual interfaces to avoid generation issues
interface Chapter {
    id: string;
    name: string;
    city: string;
    region: string;
    description: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    meeting_schedule: string | null;
    logo_url: string | null;
    cover_image_url: string | null;
    is_active: boolean;
    member_count: number | null;
    social_media: any;
}

export function ChapterManager({ managedChapterId }: ChapterManagerProps) {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState<'list' | 'edit' | 'create'>('list');

    const defaultChapter: Chapter = {
        id: '',
        name: '',
        city: '',
        region: '',
        description: '',
        contact_email: '',
        contact_phone: '',
        meeting_schedule: '',
        logo_url: null,
        cover_image_url: null,
        is_active: true,
        member_count: 0,
        social_media: {}
    };

    // Fetch chapters on mount
    useEffect(() => {
        fetchChapters();
    }, [managedChapterId]);

    const fetchChapters = async () => {
        try {
            setLoading(true);
            let query = supabase.from("chapters" as any).select("*").order("name");

            // If managing specific chapter, filter by it
            if (managedChapterId) {
                query = query.eq("id", managedChapterId);
            }

            const { data, error } = await query;
            if (error) throw error;

            const fetchedChapters = (data as any) || [];
            setChapters(fetchedChapters);

            // If managing specific chapter, automatically select it
            if (managedChapterId && fetchedChapters.length > 0) {
                setSelectedChapter(fetchedChapters[0]);
                setView('edit');
            }
        } catch (error) {
            console.error("Error fetching chapters:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load chapters"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateChapter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChapter) return;

        try {
            setSaving(true);
            const { error } = await supabase
                .from("chapters" as any)
                .update({
                    name: selectedChapter.name,
                    city: selectedChapter.city,
                    region: selectedChapter.region,
                    description: selectedChapter.description,
                    contact_email: selectedChapter.contact_email,
                    contact_phone: selectedChapter.contact_phone,
                    meeting_schedule: selectedChapter.meeting_schedule,
                    is_active: selectedChapter.is_active,
                    member_count: selectedChapter.member_count
                })
                .eq("id", selectedChapter.id);

            if (error) throw error;

            toast({ title: "Success", description: "Chapter updated successfully" });
            fetchChapters(); // Refresh data
        } catch (error) {
            console.error("Error updating chapter:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update chapter"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCreateChapter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChapter) return;

        try {
            setSaving(true);
            // Remove id from the object to let Supabase generate it
            const { id, ...newChapterData } = selectedChapter;

            const { data, error } = await supabase
                .from("chapters" as any)
                .insert([newChapterData])
                .select()
                .single();

            if (error) throw error;

            toast({ title: "Success", description: "Chapter created successfully" });
            await fetchChapters();

            // Switch to edit mode with the new chapter to allow adding executives/activities immediately
            setSelectedChapter(data as Chapter);
            setView('edit');
        } catch (error) {
            console.error("Error creating chapter:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create chapter"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteChapter = async (chapterId: string) => {
        try {
            const { error } = await supabase
                .from("chapters" as any)
                .delete()
                .eq("id", chapterId);

            if (error) throw error;

            toast({ title: "Success", description: "Chapter deleted successfully" });
            fetchChapters();
        } catch (error) {
            console.error("Error deleting chapter:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete chapter"
            });
        }
    };

    if (loading) return <LoadingSpinner size="lg" />;

    // Edit/Create View with Tabs
    if ((view === 'edit' || view === 'create') && selectedChapter) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    {!managedChapterId && (
                        <Button variant="outline" size="icon" onClick={() => setView('list')}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {view === 'create' ? 'Create New Chapter' : selectedChapter.name}
                        </h2>
                        {view === 'edit' && (
                            <p className="text-muted-foreground flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> {selectedChapter.city}, {selectedChapter.region}
                            </p>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="details">
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="executives">Executives</TabsTrigger>
                        <TabsTrigger value="activities">Activities</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                        <Card>
                            <CardHeader>
                                <CardTitle>{view === 'create' ? 'New Chapter Details' : 'Chapter Information'}</CardTitle>
                                <CardDescription>
                                    {view === 'create' ? 'Enter the details for the new chapter.' : 'Update the basic details of this chapter.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={view === 'create' ? handleCreateChapter : handleUpdateChapter} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Chapter Name</Label>
                                            <Input
                                                value={selectedChapter.name}
                                                onChange={e => setSelectedChapter({ ...selectedChapter, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <Input
                                                value={selectedChapter.city}
                                                onChange={e => setSelectedChapter({ ...selectedChapter, city: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Region</Label>
                                            <Input
                                                value={selectedChapter.region}
                                                onChange={e => setSelectedChapter({ ...selectedChapter, region: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Meeting Schedule</Label>
                                            <Input
                                                value={selectedChapter.meeting_schedule || ''}
                                                onChange={e => setSelectedChapter({ ...selectedChapter, meeting_schedule: e.target.value })}
                                                placeholder="e.g. First Saturday of every month"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Contact Email</Label>
                                            <Input
                                                type="email"
                                                value={selectedChapter.contact_email || ''}
                                                onChange={e => setSelectedChapter({ ...selectedChapter, contact_email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Contact Phone</Label>
                                            <Input
                                                value={selectedChapter.contact_phone || ''}
                                                onChange={e => setSelectedChapter({ ...selectedChapter, contact_phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Member Count (Approx)</Label>
                                            <Input
                                                type="number"
                                                value={selectedChapter.member_count || 0}
                                                onChange={e => setSelectedChapter({ ...selectedChapter, member_count: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2 pt-8">
                                            <Switch
                                                checked={selectedChapter.is_active}
                                                onCheckedChange={checked => setSelectedChapter({ ...selectedChapter, is_active: checked })}
                                            />
                                            <Label>Active Status</Label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={selectedChapter.description || ''}
                                            onChange={e => setSelectedChapter({ ...selectedChapter, description: e.target.value })}
                                            className="h-32"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={saving}>
                                            {saving && <LoadingSpinner size="sm" className="mr-2" />}
                                            {view === 'create' ? 'Create Chapter' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {view === 'edit' && (
                        <>
                            <TabsContent value="executives">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Chapter Executives</CardTitle>
                                        <CardDescription>Manage your chapter's executive team.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChapterExecutivesManager chapterId={selectedChapter.id} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="activities">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Activities & Events</CardTitle>
                                        <CardDescription>Post and manage chapter activities.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChapterActivitiesManager chapterId={selectedChapter.id} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        );
    }

    // List View (For Global Admins)
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>NUGSA Chapters</CardTitle>
                    <CardDescription>Manage all chapters across Germany</CardDescription>
                </div>
                <Button onClick={() => {
                    setSelectedChapter(defaultChapter);
                    setView('create');
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Chapter
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Chapter Name</TableHead>
                            <TableHead>Region</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {chapters.map((chapter) => (
                            <TableRow key={chapter.id}>
                                <TableCell className="font-medium">{chapter.name}</TableCell>
                                <TableCell>{chapter.city}, {chapter.region}</TableCell>
                                <TableCell>{chapter.member_count}</TableCell>
                                <TableCell>
                                    <Badge variant={chapter.is_active ? "default" : "secondary"}>
                                        {chapter.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedChapter(chapter);
                                            setView('edit');
                                        }}
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Manage
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete {chapter.name}? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteChapter(chapter.id)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
