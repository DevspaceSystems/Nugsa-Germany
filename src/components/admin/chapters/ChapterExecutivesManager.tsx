import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Upload, User, Mail, Phone } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ChapterExecutivesManagerProps {
    chapterId: string;
}

interface ChapterExecutive {
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

export function ChapterExecutivesManager({ chapterId }: ChapterExecutivesManagerProps) {
    const [executives, setExecutives] = useState<ChapterExecutive[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingExecutive, setEditingExecutive] = useState<ChapterExecutive | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<ChapterExecutive>>({
        name: '',
        position: '',
        bio: '',
        email: '',
        phone: '',
        order_priority: 0,
        is_active: true
    });

    useEffect(() => {
        fetchExecutives();
    }, [chapterId]);

    const fetchExecutives = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('chapter_leaders' as any)
                .select('*')
                .eq('chapter_id', chapterId)
                .order('order_priority', { ascending: true });

            if (error) throw error;
            setExecutives((data || []) as unknown as ChapterExecutive[]);
        } catch (error) {
            console.error("Error fetching executives:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to load executives" });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (executive?: ChapterExecutive) => {
        if (executive) {
            setEditingExecutive(executive);
            setFormData({
                name: executive.name,
                position: executive.position,
                bio: executive.bio || '',
                email: executive.email || '',
                phone: executive.phone || '',
                order_priority: executive.order_priority,
                is_active: executive.is_active,
                image_url: executive.image_url
            });
        } else {
            setEditingExecutive(null);
            setFormData({
                name: '',
                position: '',
                bio: '',
                email: '',
                phone: '',
                order_priority: executives.length + 1,
                is_active: true
            });
        }
        setImageFile(null);
        setIsDialogOpen(true);
    };

    const handleKeyChange = (key: keyof ChapterExecutive, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let imageUrl = formData.image_url;

            // Upload Image if selected
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('chapter-images')
                    .upload(`leaders/${fileName}`, imageFile); // Using 'leaders/' prefix still fine, or change to executives? 'leaders' folder is fine.

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('chapter-images')
                    .getPublicUrl(`leaders/${fileName}`);

                imageUrl = publicUrl;
            }

            const executiveData = {
                chapter_id: chapterId,
                name: formData.name,
                position: formData.position,
                bio: formData.bio || null,
                email: formData.email || null,
                phone: formData.phone || null,
                order_priority: formData.order_priority,
                is_active: formData.is_active,
                image_url: imageUrl
            };

            if (editingExecutive) {
                const { error } = await supabase
                    .from('chapter_leaders' as any)
                    .update(executiveData)
                    .eq('id', editingExecutive.id);
                if (error) throw error;
                toast({ title: "Success", description: "Executive updated" });
            } else {
                const { error } = await supabase
                    .from('chapter_leaders' as any)
                    .insert([executiveData]);
                if (error) throw error;
                toast({ title: "Success", description: "Executive added" });
            }

            setIsDialogOpen(false);
            fetchExecutives();

        } catch (error) {
            console.error("Error saving executive:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to save executive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('chapter_leaders' as any).delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Success", description: "Executive deleted" });
            fetchExecutives();
        } catch (error) {
            console.error("Error deleting executive:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete executive" });
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Executive Team</h3>
                <Button onClick={() => handleOpenDialog()} size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Executive
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {executives.map((executive) => (
                    <Card key={executive.id} className="relative group">
                        <CardContent className="pt-6">
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(executive)}>
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
                                            <AlertDialogTitle>Delete Executive</AlertDialogTitle>
                                            <AlertDialogDescription>Are you sure you want to remove {executive.name}?</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(executive.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-3">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={executive.image_url || undefined} />
                                    <AvatarFallback><User className="w-10 h-10" /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-lg">{executive.name}</h4>
                                    <p className="text-primary font-medium">{executive.position}</p>
                                </div>
                                <div className="flex gap-2 text-sm text-muted-foreground">
                                    {executive.email && <span title={executive.email}><Mail className="w-4 h-4" /></span>}
                                    {executive.phone && <span title={executive.phone}><Phone className="w-4 h-4" /></span>}
                                </div>
                                <Badge variant={executive.is_active ? "secondary" : "outline"}>
                                    {executive.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {executives.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-muted/10">
                    <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No executives added yet.</p>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingExecutive ? "Edit Executive" : "Add New Executive"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input required value={formData.name} onChange={e => handleKeyChange('name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Position</Label>
                                <Input required value={formData.position} onChange={e => handleKeyChange('position', e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Profile Image</Label>
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url || undefined} />
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => e.target.files && setImageFile(e.target.files[0])}
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Bio</Label>
                            <Textarea value={formData.bio || ''} onChange={e => handleKeyChange('bio', e.target.value)} rows={3} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email (Optional)</Label>
                                <Input type="email" value={formData.email || ''} onChange={e => handleKeyChange('email', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone (Optional)</Label>
                                <Input value={formData.phone || ''} onChange={e => handleKeyChange('phone', e.target.value)} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-2 w-1/3">
                                <Label>Order Priority</Label>
                                <Input type="number" value={formData.order_priority} onChange={e => handleKeyChange('order_priority', parseInt(e.target.value))} />
                            </div>
                            <div className="flex items-center space-x-2 pt-6">
                                <Switch checked={formData.is_active} onCheckedChange={c => handleKeyChange('is_active', c)} />
                                <Label>Active</Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <LoadingSpinner size="sm" className="mr-2" />}
                                Save Executive
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
