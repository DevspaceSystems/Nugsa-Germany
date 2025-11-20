import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Eye, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StudentDetailModal } from "./StudentDetailModal";
import { useAuth } from "@/hooks/useAuth";

interface StudentProfile {
  india_state: string;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  university: string | null;
  is_verified: boolean | null;
  created_at: string | null;
  profile_image_url: string | null;
  role: string | null;
  current_state: string | null;
  year_of_enrollment: number | null;
}
interface VerificationModuleProps {
  onStatsUpdate?: () => Promise<void>;
}

export function VerificationModule({ onStatsUpdate }: VerificationModuleProps) {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<StudentProfile | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, university, is_verified, created_at, profile_image_url, role, india_state, year_of_enrollment');

      if (error) throw error;

      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const roleMatch = roleFilter === "all" || student.role === roleFilter;
    const statusMatch = statusFilter === "all" || 
      (statusFilter === "verified" && student.is_verified) ||
      (statusFilter === "pending" && !student.is_verified);
    const universityMatch = !universityFilter || 
      (student.university && student.university.toLowerCase().includes(universityFilter.toLowerCase()));
    const stateMatch = !stateFilter || 
      (student.india_state && student.india_state.toLowerCase().includes(stateFilter.toLowerCase()));
    const nameMatch = !nameFilter || 
      (student.first_name && student.first_name.toLowerCase().includes(nameFilter.toLowerCase())) ||
      (student.last_name && student.last_name.toLowerCase().includes(nameFilter.toLowerCase()));

    return roleMatch && statusMatch && universityMatch && stateMatch && nameMatch;
  });

  const handleVerificationUpdate = async (studentId: string, isVerified: boolean) => {
    try {

      // Prevent user from deleting themselves
      if (currentUser && studentId === currentUser.id) {
        toast({
          title: "Error",
          description: "You cannot unverifiy your own account!",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Student ${isVerified ? 'verified' : 'unverified'} successfully!`,
      });

      fetchStudents();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (studentId: string) => {
    try {
      console.log("Deleting user with ID:", studentId);

      // Prevent user from deleting themselves
      if (currentUser && studentId === currentUser.id) {
        toast({
          title: "Error",
          description: "You cannot delete your own account!",
          variant: "destructive",
        });
        return;
      }
      
      // Delete associated data first
      await Promise.all([
        supabase.from('assistance_requests').delete().eq('student_id', studentId),
        supabase.from('messages').delete().eq('sender_id', studentId),
        supabase.from('messages').delete().eq('recipient_id', studentId),
        supabase.from('community_messages').delete().eq('sender_id', studentId),
        supabase.from('admin_approvals').delete().eq('applicant_id', studentId)
      ]);

      // Delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentId);

      if (profileError) throw profileError;

      // Delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(studentId);
      if (authError) {
        console.warn("Could not delete auth user (admin privileges may be required):", authError);
      }

      toast({
        title: "Success",
        description: "User deleted successfully!",
      });

      setDeleteConfirmStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const openStudentDetail = (student: StudentProfile) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  async function handleRoleUpdate(id: string, checked: boolean): Promise<void> {
    try {

      // Prevent user from deleting themselves
      if (currentUser && id === currentUser.id) {
        toast({
          title: "Error",
          description: "You cannot change your own account role!",
          variant: "destructive",
        });
        return;
      }

      const newRole = checked ? "admin" : "student";
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role updated to ${newRole} successfully!`,
      });

      fetchStudents();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  }
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account Verification</CardTitle>
          <CardDescription>
            Manage user account verification status and roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">University</label>
              <Input
                placeholder="Filter by university..."
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Input
                placeholder="Filter by state..."
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Name
              </label>
              <Input
                type="text"
                placeholder="e.g., Mark Febirir"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Avatar className="w-10 h-10">
                        <AvatarImage 
                          src={student.profile_image_url || "/icon.png"} 
                          alt={`${student.first_name} ${student.last_name}`} 
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => openStudentDetail(student)}
                        className="text-left hover:text-primary hover:underline font-medium"
                      >
                        {student.first_name} {student.last_name}
                      </button>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={student.role === "admin" || false}
                          onCheckedChange={(checked) => handleRoleUpdate(student.id, checked)}
                        />
                        <span className="text-sm">
                          {student.role === "admin" ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Admin
                            </span>
                          ) : (
                            <span className="flex items-center text-yellow-600">
                              <Clock className="w-4 h-4 mr-1" />
                              Student
                            </span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{student.university || 'Not specified'}</TableCell>
                    <TableCell>{student.india_state || 'Not specified'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={student.is_verified || false}
                          onCheckedChange={(checked) => handleVerificationUpdate(student.id, checked)}
                        />
                        <span className="text-sm">
                          {student.is_verified ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="flex items-center text-yellow-600">
                              <Clock className="w-4 h-4 mr-1" />
                              Pending
                            </span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(student.created_at || '').toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openStudentDetail(student)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmStudent(student)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          studentId={selectedStudent.id}
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmStudent} onOpenChange={() => setDeleteConfirmStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account for{" "}
              <span className="font-semibold">
                {deleteConfirmStudent?.first_name} {deleteConfirmStudent?.last_name}
              </span>
              ? This action cannot be undone and will permanently remove all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmStudent && handleDeleteUser(deleteConfirmStudent.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
