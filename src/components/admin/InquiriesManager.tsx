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
    Mail,
    Trash2,
    CheckCircle,
    Clock,
    AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ContactInquiry {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    status: 'pending' | 'in_progress' | 'resolved';
    created_at: string;
    resolved_at?: string;
    resolved_by?: string;
}

export function InquiriesManager() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
    const [inquiryFilter, setInquiryFilter] = useState("all");

    useEffect(() => {
        fetchContactInquiries();
    }, []);

    const fetchContactInquiries = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('contact_inquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContactInquiries(data || []);
        } catch (error) {
            console.error('Error fetching contact inquiries:', error);
            toast({
                title: "Error",
                description: "Failed to load contact inquiries",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInquiryStatusUpdate = async (inquiryId: string, status: 'pending' | 'in_progress' | 'resolved') => {
        try {
            const { error } = await supabase
                .from('contact_inquiries')
                .update({
                    status,
                    resolved_at: status === 'resolved' ? new Date().toISOString() : null,
                    resolved_by: status === 'resolved' ? user?.id : null
                })
                .eq('id', inquiryId);

            if (error) throw error;

            toast({
                title: "Success",
                description: `Inquiry marked as ${status.replace('_', ' ')}`,
            });
            fetchContactInquiries();
        } catch (error) {
            console.error('Error updating inquiry status:', error);
            toast({
                title: "Error",
                description: "Failed to update inquiry status",
                variant: "destructive",
            });
        }
    };

    const handleDeleteInquiry = async (inquiryId: string) => {
        try {
            const { error } = await supabase
                .from('contact_inquiries')
                .delete()
                .eq('id', inquiryId);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Inquiry deleted successfully",
            });
            fetchContactInquiries();
        } catch (error) {
            console.error('Error deleting inquiry:', error);
            toast({
                title: "Error",
                description: "Failed to delete inquiry",
                variant: "destructive",
            });
        }
    };

    const filteredInquiries = contactInquiries.filter(inquiry =>
        inquiryFilter === "all" || inquiry.status === inquiryFilter
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Mail className="w-5 h-5 mr-2" />
                            Contact Inquiries
                        </div>
                        <Select value={inquiryFilter} onValueChange={setInquiryFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInquiries.map((inquiry) => (
                                    <TableRow key={inquiry.id}>
                                        <TableCell className="font-medium">{inquiry.name}</TableCell>
                                        <TableCell>{inquiry.email}</TableCell>
                                        <TableCell>{inquiry.phone || '-'}</TableCell>
                                        <TableCell>{inquiry.subject}</TableCell>
                                        <TableCell className="max-w-xs truncate" title={inquiry.message}>
                                            {inquiry.message}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    inquiry.status === 'resolved' ? 'default' :
                                                        inquiry.status === 'in_progress' ? 'secondary' : 'outline'
                                                }
                                                className={
                                                    inquiry.status === 'resolved' ? 'bg-green-500' :
                                                        inquiry.status === 'in_progress' ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white'
                                                }
                                            >
                                                {inquiry.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(inquiry.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                {inquiry.status !== 'resolved' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Mark Resolved"
                                                        onClick={() => handleInquiryStatusUpdate(inquiry.id, 'resolved')}
                                                    >
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    </Button>
                                                )}
                                                {inquiry.status === 'pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Mark In Progress"
                                                        onClick={() => handleInquiryStatusUpdate(inquiry.id, 'in_progress')}
                                                    >
                                                        <Clock className="w-4 h-4 text-blue-500" />
                                                    </Button>
                                                )}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete this inquiry? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteInquiry(inquiry.id)}
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
