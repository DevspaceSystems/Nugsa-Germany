import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
    Plus,
    FileText,
    Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ConstitutionDoc {
    id: string;
    title: string;
    file_url: string;
    version: string;
    is_current: boolean;
    uploaded_by: string;
    created_at: string;
    updated_at: string;
}

export function ConstitutionManager() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [constitutionDocs, setConstitutionDocs] = useState<ConstitutionDoc[]>([]);
    const [newConstitution, setNewConstitution] = useState({
        title: '',
        version: '',
        is_current: true
    });
    const [selectedConstitutionFile, setSelectedConstitutionFile] = useState<File | null>(null);

    useEffect(() => {
        fetchConstitutionDocs();
    }, []);

    const fetchConstitutionDocs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('constitution_documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setConstitutionDocs(data || []);
        } catch (error) {
            console.error('Error fetching constitution documents:', error);
            toast({
                title: "Error",
                description: "Failed to load constitution documents",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleConstitutionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedConstitutionFile) return;

        setLoading(true);
        try {
            const fileExt = selectedConstitutionFile.name.split('.').pop();
            const fileName = `constitution-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('constitution-docs')
                .upload(fileName, selectedConstitutionFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('constitution-docs')
                .getPublicUrl(fileName);

            // Mark all existing constitutions as not current if this one should be current
            if (newConstitution.is_current) {
                await supabase
                    .from('constitution_documents')
                    .update({ is_current: false })
                    .neq('id', '');
            }

            const { error } = await supabase
                .from('constitution_documents')
                .insert({
                    ...newConstitution,
                    file_url: publicUrl,
                    uploaded_by: user.id
                });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Constitution document added successfully!",
            });

            setNewConstitution({
                title: '',
                version: '',
                is_current: false
            });
            setSelectedConstitutionFile(null);
            fetchConstitutionDocs();
        } catch (error) {
            console.error('Error adding constitution document:', error);
            toast({
                title: "Error",
                description: "Failed to add constitution document",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConstitution = async (docId: string) => {
        try {
            const { error } = await supabase
                .from('constitution_documents')
                .delete()
                .eq('id', docId);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Constitution document deleted successfully",
            });
            fetchConstitutionDocs();
        } catch (error) {
            console.error('Error deleting constitution document:', error);
            toast({
                title: "Error",
                description: "Failed to delete constitution document",
                variant: "destructive",
            });
        }
    };

    function timeAgo(dateString: string): string {
        const now = new Date();
        const date = new Date(dateString);
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 60) return `${diff} second${diff !== 1 ? "s" : ""} ago`;
        const minutes = Math.floor(diff / 60);
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
        const years = Math.floor(days / 365);
        return `${years} year${years !== 1 ? "s" : ""} ago`;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Constitution Document
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleConstitutionSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="constitution-title">Title</Label>
                                <Input
                                    id="constitution-title"
                                    value={newConstitution.title}
                                    onChange={(e) => setNewConstitution({ ...newConstitution, title: e.target.value })}
                                    placeholder="Enter document title"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="constitution-version">Version</Label>
                                <Input
                                    id="constitution-version"
                                    value={newConstitution.version}
                                    onChange={(e) => setNewConstitution({ ...newConstitution, version: e.target.value })}
                                    placeholder="Enter version number"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="constitution-file">Document File (PDF)</Label>
                            <Input
                                id="constitution-file"
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setSelectedConstitutionFile(e.target.files?.[0] || null)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            <Plus className="w-4 h-4 mr-2" />
                            {loading ? "Adding..." : "Add Document"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Constitution Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {constitutionDocs.map((doc) => (
                            <Card key={doc.id}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium">{doc.title}</h4>
                                        <Badge variant={doc.is_current ? "default" : "secondary"}>
                                            {doc.is_current ? "Current" : "Archived"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Version: {doc.version}</p>
                                    <div className="flex items-center justify-between mt-4">
                                        <Badge variant={new Date(doc.created_at).getFullYear() >= (new Date).getFullYear() ? "default" : "secondary"}>
                                            {timeAgo(doc.created_at)}
                                        </Badge>
                                        <div className="flex space-x-2">
                                            <a
                                                href={doc.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline text-sm"
                                            >
                                                View
                                            </a>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-0 h-auto">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Constitution Document</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete "{doc.title}" (Version {doc.version})? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteConstitution(doc.id)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
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
