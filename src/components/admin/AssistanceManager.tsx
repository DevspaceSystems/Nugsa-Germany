import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
    Heart,
    Trash2,
    CheckCircle,
    Clock,
    User,
    MessageCircle,
    AlertCircle,
    Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface AssistanceRequest {
    id: string;
    student_id: string;
    title: string;
    description: string;
    request_type: string;
    urgency_level: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'resolved';
    admin_notes: string | null;
    created_at: string;
    profiles?: {
        first_name: string;
        last_name: string;
        email: string;
        managed_chapter_id?: string;
    };
}

export function AssistanceManager() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<AssistanceRequest[]>([]);
    const [filter, setFilter] = useState("all");
    const [editingRequest, setEditingRequest] = useState<AssistanceRequest | null>(null);
    const [adminNote, setAdminNote] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('assistance_requests')
                .select(`
                    *,
                    profiles:student_id (
                        first_name,
                        last_name,
                        email
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data as any || []);
        } catch (error) {
            console.error('Error fetching assistance requests:', error);
            toast({
                title: "Error",
                description: "Failed to load assistance requests",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId: string, status: string, note?: string) => {
        try {
            const updateData: any = { status };
            if (note !== undefined) {
                updateData.admin_notes = note;
            }

            const { error } = await supabase
                .from('assistance_requests')
                .update(updateData)
                .eq('id', requestId);

            if (error) throw error;

            toast({
                title: "Success",
                description: `Request status updated to ${status.replace('_', ' ')}`,
            });
            fetchRequests();
            setEditingRequest(null);
        } catch (error) {
            console.error('Error updating request status:', error);
            toast({
                title: "Error",
                description: "Failed to update request",
                variant: "destructive",
            });
        }
    };

    const handleDeleteRequest = async (requestId: string) => {
        try {
            const { error } = await supabase
                .from('assistance_requests')
                .delete()
                .eq('id', requestId);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Request deleted successfully",
            });
            fetchRequests();
        } catch (error) {
            console.error('Error deleting request:', error);
            toast({
                title: "Error",
                description: "Failed to delete request",
                variant: "destructive",
            });
        }
    };

    const filteredRequests = requests.filter(request =>
        filter === "all" || request.status === filter
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500 text-white';
            case 'under_review': return 'bg-blue-500 text-white';
            case 'approved': return 'bg-green-500 text-white';
            case 'rejected': return 'bg-red-500 text-white';
            case 'resolved': return 'bg-gray-500 text-white';
            default: return 'bg-gray-300';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Heart className="w-5 h-5 mr-2 text-primary" />
                            Assistance Requests
                        </div>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Urgency</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            Loading requests...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredRequests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No assistance requests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {request.profiles
                                                            ? `${request.profiles.first_name} ${request.profiles.last_name}`
                                                            : 'Unknown'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{request.profiles?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{request.request_type}</TableCell>
                                            <TableCell className="max-w-[200px] truncate font-medium">
                                                {request.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getUrgencyColor(request.urgency_level)}>
                                                    {request.urgency_level}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(request.status)}>
                                                    {request.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setEditingRequest(request);
                                                                    setAdminNote(request.admin_notes || "");
                                                                }}
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                Review
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Review Assistance Request</DialogTitle>
                                                                <DialogDescription>
                                                                    Details submitted by {request.profiles?.first_name} {request.profiles?.last_name}
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-4 py-4">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="text-sm font-semibold mb-1 block">Request Type</label>
                                                                        <div className="p-2 bg-gray-50 rounded border capitalize">{request.request_type}</div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-sm font-semibold mb-1 block">Urgency Level</label>
                                                                        <Badge className={getUrgencyColor(request.urgency_level)}>
                                                                            {request.urgency_level}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-semibold mb-1 block">Title</label>
                                                                    <div className="p-2 bg-gray-50 rounded border font-medium">{request.title}</div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-semibold mb-1 block">Description</label>
                                                                    <div className="p-3 bg-gray-50 rounded border whitespace-pre-wrap min-h-[100px]">
                                                                        {request.description}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-semibold block">Admin Status Update</label>
                                                                    <Select
                                                                        defaultValue={request.status}
                                                                        onValueChange={(val) => handleUpdateStatus(request.id, val)}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="pending">Pending</SelectItem>
                                                                            <SelectItem value="under_review">Under Review</SelectItem>
                                                                            <SelectItem value="approved">Approved</SelectItem>
                                                                            <SelectItem value="rejected">Rejected</SelectItem>
                                                                            <SelectItem value="resolved">Resolved</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-semibold block">Admin Response / Notes</label>
                                                                    <Textarea
                                                                        value={adminNote}
                                                                        onChange={(e) => setAdminNote(e.target.value)}
                                                                        placeholder="Add a note or response to the student..."
                                                                        rows={4}
                                                                    />
                                                                    <Button
                                                                        className="w-full mt-2"
                                                                        onClick={() => handleUpdateStatus(request.id, request.status, adminNote)}
                                                                    >
                                                                        Save Response
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Request</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this assistance request? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteRequest(request.id)}
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
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
