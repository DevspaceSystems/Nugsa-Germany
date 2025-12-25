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
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Users
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface BoardMember {
    id: string;
    name: string;
    position: string;
    academic_background: string;
    leadership_experience: string;
    quote: string;
    image_url: string;
    is_active: boolean;
    order_priority: number;
    year: string;
    created_at: string;
    updated_at: string;
}

export function BoardMembersManager() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
    const [yearFilter, setYearFilter] = useState("2024-2025");
    const [positionFilter, setPositionFilter] = useState("");
    const [editingBoardMember, setEditingBoardMember] = useState<BoardMember | null>(null);
    const [newBoardMember, setNewBoardMember] = useState({
        name: '',
        position: '',
        academic_background: '',
        leadership_experience: '',
        quote: '',
        image_url: '',
        year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
    });
    const [selectedBoardMemberImage, setSelectedBoardMemberImage] = useState<File | null>(null);

    useEffect(() => {
        fetchBoardMembers();
    }, []);

    const fetchBoardMembers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('board_members')
                .select('*')
                .order('order_priority', { ascending: true });

            if (error) throw error;
            setBoardMembers(data || []);
        } catch (error) {
            console.error('Error fetching board members:', error);
            toast({
                title: "Error",
                description: "Failed to load board members",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBoardMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            let imageUrl = '';

            if (selectedBoardMemberImage) {
                const fileExt = selectedBoardMemberImage.name.split('.').pop();
                const fileName = `board-member-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('board-images')
                    .upload(fileName, selectedBoardMemberImage);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('board-images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            if (editingBoardMember) {
                const { error } = await supabase
                    .from('board_members')
                    .update({
                        ...newBoardMember,
                        image_url: imageUrl || editingBoardMember.image_url,
                    })
                    .eq('id', editingBoardMember.id);

                if (error) throw error;
                toast({
                    title: "Success",
                    description: "Board member updated successfully!",
                });
            } else {
                const { error } = await supabase
                    .from('board_members')
                    .insert({
                        ...newBoardMember,
                        image_url: imageUrl,
                        is_active: true,
                        order_priority: boardMembers.length + 1
                    });

                if (error) throw error;
                toast({
                    title: "Success",
                    description: "Board member added successfully!",
                });
            }

            setNewBoardMember({
                name: '',
                position: '',
                academic_background: '',
                leadership_experience: '',
                quote: '',
                image_url: '',
                year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
            });
            setSelectedBoardMemberImage(null);
            setEditingBoardMember(null);
            fetchBoardMembers();
        } catch (error) {
            console.error('Error saving board member:', error);
            toast({
                title: "Error",
                description: "Failed to save board member",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBoardMember = async (memberId: string) => {
        try {
            const { error } = await supabase
                .from('board_members')
                .delete()
                .eq('id', memberId);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Board member deleted successfully",
            });
            fetchBoardMembers();
        } catch (error) {
            console.error('Error deleting board member:', error);
            toast({
                title: "Error",
                description: "Failed to delete board member",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        {editingBoardMember ? <Edit className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                        {editingBoardMember ? "Edit Board Member" : "Add New Board Member"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleBoardMemberSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="member-name">Name</Label>
                                <Input
                                    id="member-name"
                                    value={newBoardMember.name}
                                    onChange={(e) => setNewBoardMember({ ...newBoardMember, name: e.target.value })}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="member-position">Position</Label>
                                <Input
                                    id="member-position"
                                    value={newBoardMember.position}
                                    onChange={(e) => setNewBoardMember({ ...newBoardMember, position: e.target.value })}
                                    placeholder="e.g., President, Vice President"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="member-year">Year</Label>
                                <Select
                                    value={newBoardMember.year}
                                    onValueChange={(value) => setNewBoardMember({ ...newBoardMember, year: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {Array.from({ length: 7 }, (_, i) => {
                                            const startYear = 2019 + i;
                                            const endYear = startYear + 1;
                                            const yearRange = `${startYear}-${endYear}`;
                                            return (
                                                <SelectItem key={yearRange} value={yearRange}>
                                                    {yearRange}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="member-image">Profile Image</Label>
                                <Input
                                    id="member-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSelectedBoardMemberImage(e.target.files?.[0] || null)}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="member-academic">Academic Background</Label>
                            <Textarea
                                id="member-academic"
                                value={newBoardMember.academic_background}
                                onChange={(e) => setNewBoardMember({ ...newBoardMember, academic_background: e.target.value })}
                                placeholder="Enter academic background"
                            />
                        </div>
                        <div>
                            <Label htmlFor="member-leadership">Leadership Experience</Label>
                            <Textarea
                                id="member-leadership"
                                value={newBoardMember.leadership_experience}
                                onChange={(e) => setNewBoardMember({ ...newBoardMember, leadership_experience: e.target.value })}
                                placeholder="Enter leadership experience"
                            />
                        </div>
                        <div>
                            <Label htmlFor="member-quote">Quote/Vision</Label>
                            <Textarea
                                id="member-quote"
                                value={newBoardMember.quote}
                                onChange={(e) => setNewBoardMember({ ...newBoardMember, quote: e.target.value })}
                                placeholder="Enter inspiring quote or vision"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button type="submit" disabled={loading}>
                                {editingBoardMember ? (
                                    <>
                                        <Edit className="w-4 h-4 mr-2" />
                                        {loading ? "Updating..." : "Update Member"}
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        {loading ? "Adding..." : "Add Member"}
                                    </>
                                )}
                            </Button>
                            {editingBoardMember && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingBoardMember(null);
                                        setNewBoardMember({
                                            name: '',
                                            position: '',
                                            academic_background: '',
                                            leadership_experience: '',
                                            quote: '',
                                            image_url: '',
                                            year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
                                        });
                                        setSelectedBoardMemberImage(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Board Members Management
                        </div>
                        <div className="flex space-x-2">
                            <Select value={yearFilter} onValueChange={setYearFilter}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Filter by year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: ((new Date()).getFullYear() - 2019 + 1) }, (_, i) => {
                                        const startYear = 2019 + i;
                                        const endYear = startYear + 1;
                                        const yearRange = `${startYear}-${endYear}`;
                                        return (
                                            <SelectItem key={yearRange} value={yearRange}>
                                                {yearRange}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Filter by position..."
                                value={positionFilter}
                                onChange={(e) => setPositionFilter(e.target.value)}
                                className="w-48"
                            />
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Photo</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {boardMembers
                                    .filter(member => {
                                        const yearMatch = !yearFilter || member.year === yearFilter;
                                        const positionMatch = !positionFilter || member.position.toLowerCase().includes(positionFilter.toLowerCase());
                                        return yearMatch && positionMatch;
                                    })
                                    .map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <img
                                                    src={member.image_url || "/default-profile.png"}
                                                    alt={member.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{member.name}</TableCell>
                                            <TableCell>{member.position}</TableCell>
                                            <TableCell>{member.year}</TableCell>
                                            <TableCell>
                                                <Badge variant={member.is_active ? "default" : "secondary"}>
                                                    {member.is_active ? "Active" : "Hidden"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                const { error } = await supabase
                                                                    .from('board_members')
                                                                    .update({ is_active: !member.is_active })
                                                                    .eq('id', member.id);

                                                                if (error) throw error;

                                                                toast({
                                                                    title: "Success",
                                                                    description: `Board member ${!member.is_active ? 'hidden' : 'shown'} successfully!`,
                                                                });

                                                                fetchBoardMembers();
                                                            } catch (error) {
                                                                console.error('Error updating board member status:', error);
                                                                toast({
                                                                    title: "Error",
                                                                    description: "Failed to update board member status",
                                                                    variant: "destructive",
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        {member.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingBoardMember(member);
                                                            setNewBoardMember({
                                                                name: member.name,
                                                                position: member.position,
                                                                academic_background: member.academic_background,
                                                                leadership_experience: member.leadership_experience,
                                                                quote: member.quote,
                                                                image_url: member.image_url,
                                                                year: member.year
                                                            });
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Board Member</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{member.name}"? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteBoardMember(member.id)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
