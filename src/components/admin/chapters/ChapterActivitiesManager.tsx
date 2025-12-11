import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Calendar, MapPin, Users, ImageIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface ChapterActivitiesManagerProps {
    chapterId: string;
}

interface ChapterActivity {
    id: string;
    chapter_id: string;
    title: string;
    description: string | null;
    date: string;
    end_date: string | null;
    location: string | null;
    image_url: string | null;
    category: string | null;
    attendees_count: number | null;
    is_featured: boolean;
}

export function ChapterActivitiesManager({ chapterId }: ChapterActivitiesManagerProps) {
    const [activities, setActivities] = useState<ChapterActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<ChapterActivity | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<ChapterActivity>>({
        title: '',
        description: '',
        date: '',
        end_date: '',
        location: '',
        category: 'General',
        attendees_count: 0,
        is_featured: false
    });

    useEffect(() => {
        fetchActivities();
    }, [chapterId]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('chapter_activities' as any)
                .select('*')
                .eq('chapter_id', chapterId)
                .order('date', { ascending: false });

            if (error) throw error;
            setActivities((data || []) as unknown as ChapterActivity[]);
        } catch (error) {
            console.error("Error fetching activities:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to load activities" });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (activity?: ChapterActivity) => {
        if (activity) {
            setEditingActivity(activity);
            setFormData({
                title: activity.title,
                description: activity.description || '',
                date: activity.date ? new Date(activity.date).toISOString().slice(0, 16) : '', // Format for datetime-local
                end_date: activity.end_date ? new Date(activity.end_date).toISOString().slice(0, 16) : '',
                location: activity.location || '',
                category: activity.category || 'General',
                attendees_count: activity.attendees_count || 0,
                is_featured: activity.is_featured,
                image_url: activity.image_url
            });
        } else {
            setEditingActivity(null);
            setFormData({
                title: '',
                description: '',
                date: new Date().toISOString().slice(0, 16),
                end_date: '',
                location: '',
                category: 'General',
                attendees_count: 0,
                is_featured: false
            });
        }
        setImageFile(null);
        setIsDialogOpen(true);
    };

    const handleKeyChange = (key: keyof ChapterActivity, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let imageUrl = formData.image_url;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('chapter-images')
                    .upload(`activities/${fileName}`, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('chapter-images')
                    .getPublicUrl(`activities/${fileName}`);

                imageUrl = publicUrl;
            }

            const activityData = {
                chapter_id: chapterId,
                title: formData.title,
                description: formData.description || null,
                date: new Date(formData.date!).toISOString(),
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
                location: formData.location || null,
                category: formData.category || 'General',
                attendees_count: formData.attendees_count,
                is_featured: formData.is_featured,
                image_url: imageUrl
            };

            if (editingActivity) {
                const { error } = await supabase
                    .from('chapter_activities' as any)
                    .update(activityData)
                    .eq('id', editingActivity.id);
                if (error) throw error;
                toast({ title: "Success", description: "Activity updated" });
            } else {
                const { error } = await supabase
                    .from('chapter_activities' as any)
                    .insert([activityData]);
                if (error) throw error;
                toast({ title: "Success", description: "Activity added" });
            }

            setIsDialogOpen(false);
            fetchActivities();

        } catch (error) {
            console.error("Error saving activity:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to save activity" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('chapter_activities' as any).delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Success", description: "Activity deleted" });
            fetchActivities();
        } catch (error) {
            console.error("Error deleting activity:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete activity" });
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Events & Activities</h3>
                <Button onClick={() => handleOpenDialog()} size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Event
                </Button>
            </div>

            <div className="space-y-4">
                {activities.map((activity) => (
                    <Card key={activity.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            {/* Image Section */}
                            <div className="w-full md:w-48 h-32 md:h-auto bg-muted relative">
                                {activity.image_url ? (
                                    <img src={activity.image_url} alt={activity.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <ImageIcon className="w-8 h-8 opacity-20" />
                                    </div>
                                )}
                                {activity.is_featured && (
                                    <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">Featured</Badge>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg">{activity.title}</h4>
                                            <Badge variant="outline" className="mt-1">{activity.category}</Badge>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(activity)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Activity</AlertDialogTitle>
                                                        <AlertDialogDescription>Are you sure you want to remove this activity?</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(activity.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{activity.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {format(new Date(activity.date), "PPP p")}
                                    </div>
                                    {activity.location && (
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {activity.location}
                                        </div>
                                    )}
                                    {activity.attendees_count !== null && (
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-1" />
                                            {activity.attendees_count} Attendees
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {activities.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-muted/10">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No activities found.</p>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingActivity ? "Edit Activity" : "New Activity"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Activity Title</Label>
                            <Input required value={formData.title} onChange={e => handleKeyChange('title', e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date & Time</Label>
                                <Input type="datetime-local" required value={formData.date} onChange={e => handleKeyChange('date', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date & Time</Label>
                                <Input type="datetime-local" value={formData.end_date} onChange={e => handleKeyChange('end_date', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input value={formData.location || ''} onChange={e => handleKeyChange('location', e.target.value)} placeholder="e.g. Community Hall" />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={formData.category || 'General'} onValueChange={v => handleKeyChange('category', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Cultural">Cultural</SelectItem>
                                        <SelectItem value="Academic">Academic</SelectItem>
                                        <SelectItem value="Social">Social</SelectItem>
                                        <SelectItem value="Sports">Sports</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={formData.description || ''} onChange={e => handleKeyChange('description', e.target.value)} rows={4} />
                        </div>

                        <div className="space-y-2">
                            <Label>Cover Image</Label>
                            <div className="flex items-center gap-4">
                                {formData.image_url || imageFile ? (
                                    <img
                                        src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url!}
                                        alt="Preview"
                                        className="h-20 w-32 object-cover rounded"
                                    />
                                ) : (
                                    <div className="h-20 w-32 bg-muted rounded flex items-center justify-center">
                                        <ImageIcon className="opacity-20" />
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => e.target.files && setImageFile(e.target.files[0])}
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-2">
                            <div className="space-y-2 w-1/3">
                                <Label>Est. Attendees</Label>
                                <Input type="number" value={formData.attendees_count || 0} onChange={e => handleKeyChange('attendees_count', parseInt(e.target.value))} />
                            </div>
                            <div className="flex items-center space-x-2 pt-6">
                                <Switch checked={formData.is_featured} onCheckedChange={c => handleKeyChange('is_featured', c)} />
                                <Label>Featured Event</Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <LoadingSpinner size="sm" className="mr-2" />}
                                Save Activity
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
