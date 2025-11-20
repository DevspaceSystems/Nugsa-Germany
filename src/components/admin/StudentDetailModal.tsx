import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  FileText, 
  ExternalLink,
  CheckCircle,
  Clock,
  Download,
  Linkedin
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface StudentDetailModalProps {
  studentId: string | null;
  open: boolean;
  onClose: () => void;
}

export function StudentDetailModal({ studentId, open, onClose }: StudentDetailModalProps) {
  const [student, setStudent] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentId && open) {
      fetchStudentDetails();
    }
  }, [studentId, open]);

  const fetchStudentDetails = async () => {
    if (!studentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", studentId)
        .single();

      if (data && !error) {
        setStudent(data);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  if (!student && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Student Profile Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : student ? (
          <div className="space-y-6">
            {/* Header with Photo and Basic Info */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {student.profile_image_url ? (
                  <img 
                    src={student.profile_image_url} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">
                    {student.first_name} {student.last_name}
                  </h2>
                  <Badge variant={student.is_verified ? "default" : "secondary"}>
                    {student.is_verified ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </>
                    )}
                  </Badge>
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {student.email}
                  </div>
                  {student.whatsapp_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {student.whatsapp_number} (WhatsApp)
                    </div>
                  )}
                  {student.university && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      {student.university}
                    </div>
                  )}
                  {student.linkedin_url && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      {student.linkedin_url}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.date_of_birth && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(student.date_of_birth).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {student.gender && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="mt-1">{student.gender}</p>
                  </div>
                )}
                {student.marital_status && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                    <p className="mt-1">{student.marital_status}</p>
                  </div>
                )}
                
                
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.level_of_study && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Level of Study</label>
                    <p className="mt-1">{student.level_of_study}</p>
                  </div>
                )}
                {student.university && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">University Name</label>
                    <p className="mt-1">{student.university}</p>
                  </div>
                )}
                {student.major && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Major</label>
                    <p className="mt-1">{student.major}</p>
                  </div>
                )}
                {student.year_of_enrollment && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Year of Enrollment</label>
                    <p className="mt-1">{student.year_of_enrollment}</p>
                  </div>
                )}
                {student.expected_completion_year && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Expected Completion</label>
                    <p className="mt-1">{student.expected_completion_year}</p>
                  </div>
                )}
                {student.year_of_study && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Year of Study</label>
                    <p className="mt-1">{student.year_of_study} year(s)</p>
                  </div>
                )}
                
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* German Address */}
                {(student.india_city || student.india_state) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Germany Address</label>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <div>
                        <p>
                          {student.india_city && `${student.india_city}, `}
                          {student.india_state && `${student.india_state} `}
                          {student.india_pincode}
                        </p>
                        {student.india_phone && <p>Phone: {student.india_phone}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ghanaian Address */}
                {(student.ghana_city || student.ghana_region) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ghana Address</label>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <div>
                        <p>
                          {student.ghana_city && `${student.ghana_city}, `}
                          {student.ghana_region && `${student.ghana_region} `}
                          {student.ghana_pincode}
                        </p>
                        {student.ghana_mobile_number && <p>Phone: {student.ghana_mobile_number}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {student.emergency_contact_name && (
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="mt-1">{student.emergency_contact_name}</p>
                  </div>
                  {student.emergency_contact_relationship && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                      <p className="mt-1">{student.emergency_contact_relationship}</p>
                    </div>
                  )}
                  {student.emergency_contact_number && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                      <p className="mt-1">{student.emergency_contact_number}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {student.passport_document_url && (
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      <span>Passport Document</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(student.passport_document_url!, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(student.passport_document_url!, 'passport.pdf')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bio */}
            {student.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>Bio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{student.bio}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Student not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}