import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Save, User, CheckCircle, Clock, Mail, MapPin, GraduationCap, Calendar, FileText, Upload, X, Eye, EyeOff, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Tables } from "@/integrations/supabase/types";
import { GERMAN_UNIVERSITIES } from "@/lib/universities";

type Profile = Tables<"profiles"> & {
  india_address?: string | null;
  india_city?: string | null;
  india_state?: string | null;
  india_pincode?: string | null;
  ghana_address?: string | null;
  ghana_city?: string | null;
  ghana_region?: string | null;
  ghana_pincode?: string | null;
  ghana_mobile_number?: string | null;
};

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      // Redirect to auth page after 3 seconds
      const timer = setTimeout(() => {
        navigate("/auth");
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      fetchProfile();
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // console.log('Profile error:', error);
    // console.log('User ID:', user?.id);

    if (data && !error) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleInputChange = (field: keyof Profile, value: string | number | boolean | Date | null) => {
    if (profile) {
      console.log("Attribute:", field + " " + value);
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleFileUpload = async (file: File, type: 'profile' | 'passport') => {
    if (!user) return;

    setUploading(true);
    try {
      const bucketName = type === 'profile' ? 'profile-pictures' : 'documents';
      const fileName = `${user.id}/${type}_${Date.now()}.${file.name.split('.').pop()}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const fieldName = type === 'profile' ? 'profile_image_url' : 'passport_document_url';
      handleInputChange(fieldName, data.publicUrl);

      toast({
        title: "Success",
        description: `Click on save button to save your ${type === 'profile' ? 'Profile picture' : 'Passport document'} !`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        gender: profile.gender,
        marital_status: profile.marital_status,
        date_of_birth: profile.date_of_birth,
        ghana_mobile_number: profile.ghana_mobile_number,
        level_of_study: profile.level_of_study,
        year_of_enrollment: profile.year_of_enrollment,
        expected_completion_year: profile.expected_completion_year,
        university: profile.university,
        major: profile.major,
        year_of_study: profile.year_of_study,
        graduation_year: profile.graduation_year,
        current_city: profile.current_city,
        current_state: profile.current_state,
        hometown: profile.hometown,
        ghana_address: profile.ghana_address,
        ghana_city: profile.ghana_city,
        ghana_region: profile.ghana_region,
        ghana_pincode: profile.ghana_pincode,
        current_address_street: profile.current_address_street,
        current_address_city: profile.current_address_city,
        current_address_state: profile.current_address_state,
        current_address_postal_code: profile.current_address_postal_code,
        permanent_address_street: profile.permanent_address_street,
        permanent_address_city: profile.permanent_address_city,
        permanent_address_state: profile.permanent_address_state,
        permanent_address_postal_code: profile.permanent_address_postal_code,
        same_as_current_address: profile.same_as_current_address,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_relationship: profile.emergency_contact_relationship,
        emergency_contact_number: profile.emergency_contact_number,
        linkedin_url: profile.linkedin_url,
        whatsapp_number: profile.whatsapp_number,
        bio: profile.bio,
        profile_image_url: profile.profile_image_url,
        passport_document_url: profile.passport_document_url,
        india_phone: profile.india_phone,
        india_state: profile.india_state,
        india_city: profile.india_city,
        india_address: profile.india_address,
        india_pincode: profile.india_pincode,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    }
    setSaving(false);
  };



  // Add password update function
  const handlePasswordUpdate = async () => {
    if (!user) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setUpdatingPassword(true);

    try {
      // First, reauthenticate the user with their current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      // if (signInError) {
      //   toast({
      //     title: "Error",
      //     description: "Current password is incorrect",
      //     variant: "destructive",
      //   });
      //   return;
      // }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Password updated successfully!",
      });

      // Clear the form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to access your profile.</p>
          <p className="text-sm text-gray-500">Redirecting to sign in page in 3 seconds...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile Not Found</h1>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-amber-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header */}
        {/* <div className="mb-12 text-center">
          <div className="glass-effect rounded-2xl p-8 mb-8 floating-animation">
            <h1 className="text-5xl font-bold gradient-text mb-4">My Profile</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your personal and academic information with our modern, secure platform
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              {profile.is_verified ? (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verified Profile
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Pending Verification
                </Badge>
              )}
            </div>
          </div>
        </div> */}

        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent mb-3">
              My Profile
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your personal and academic information
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              {profile.is_verified ? (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1.5 text-sm shadow-md">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verified Profile
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1.5 text-sm shadow-md">
                  <Clock className="w-4 h-4 mr-2" />
                  Pending Verification
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="profile-card text-center sticky top-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center justify-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Profile Photo
              </h3>
              <div className="profile-avatar-container mb-6">
                <Avatar className="w-44 h-44 mx-auto border-4 border-primary/20 shadow-xl transition-all duration-300 hover:border-primary/40 hover:shadow-2xl">
                  <AvatarImage src={profile.profile_image_url || ""} alt="Profile" className="object-cover" />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-100 to-amber-100">
                    <User className="w-20 h-20 text-primary" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'profile');
                }}
              />
              <button
                className="modern-button w-full mb-3 flex items-center justify-center"
                onClick={() => document.getElementById('profile-image')?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500">
                JPG, PNG or GIF (max 1MB)
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal Information */}
            <div className="profile-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                  <p className="text-sm text-gray-500">Your basic personal details</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name</Label>
                  <Input
                    id="first_name"
                    value={profile.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profile.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-100 border-gray-200 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="india_phone" className="text-sm font-medium text-gray-700">Phone Number (Germany)</Label>
                  <Input
                    id="india_phone"
                    value={profile.india_phone || ""}
                    onChange={(e) => handleInputChange("india_phone", e.target.value)}
                    placeholder="+49 1512 3456789"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ghana_mobile_number" className="text-sm font-medium text-gray-700">Ghana Mobile Number</Label>
                  <Input
                    id="ghana_mobile_number"
                    value={profile.ghana_mobile_number || ""}
                    onChange={(e) => handleInputChange("ghana_mobile_number", e.target.value)}
                    placeholder="+233 24 123 4567"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender</Label>
                  <Select
                    value={profile.gender || ""}
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marital_status" className="text-sm font-medium text-gray-700">Marital Status</Label>
                  <Select
                    value={profile.marital_status || ""}
                    onValueChange={(value) => handleInputChange("marital_status", value)}
                  >
                    <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700">Date of Birth</Label>
                  <DatePicker
                    selected={profile.date_of_birth ? new Date(profile.date_of_birth) : null}
                    onChange={(date: Date | null) => handleInputChange("date_of_birth", date ? date.toISOString().split('T')[0] : null)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 bg-gradient-to-br from-white to-gray-50/30"
                    placeholderText="Select date of birth"
                    showYearDropdown
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number" className="text-sm font-medium text-gray-700">WhatsApp Number</Label>
                  <Input
                    id="whatsapp_number"
                    value={profile.whatsapp_number || ""}
                    onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
                    placeholder="+233 24 123 4567"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url" className="text-sm font-medium text-gray-700">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    value={profile.linkedin_url || ""}
                    onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="input-modern"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="profile-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Academic Information</h3>
                  <p className="text-sm text-gray-500">Your educational details in Germany</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="level_of_study" className="text-sm font-medium text-gray-700">Level of Study</Label>
                  <Select
                    value={profile.level_of_study || ""}
                    onValueChange={(value) => handleInputChange("level_of_study", value)}
                  >
                    <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                      <SelectItem value="Master's">Master's</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year_of_enrollment" className="text-sm font-medium text-gray-700">Year of Enrollment</Label>
                  <Input
                    id="year_of_enrollment"
                    type="number"
                    value={profile.year_of_enrollment || ""}
                    onChange={(e) => handleInputChange("year_of_enrollment", parseInt(e.target.value))}
                    placeholder="2020"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected_completion_year" className="text-sm font-medium text-gray-700">Expected Completion Year</Label>
                  <Input
                    id="expected_completion_year"
                    type="number"
                    value={profile.expected_completion_year || ""}
                    onChange={(e) => handleInputChange("expected_completion_year", parseInt(e.target.value))}
                    placeholder="2024"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university" className="text-sm font-medium text-gray-700">University/Institution</Label>
                  <Select
                    value={profile.university || ""}
                    onValueChange={(value) => handleInputChange("university", value)}
                  >
                    <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {GERMAN_UNIVERSITIES.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major" className="text-sm font-medium text-gray-700">Major/Course</Label>
                  <Input
                    id="major"
                    value={profile.major || ""}
                    onChange={(e) => handleInputChange("major", e.target.value)}
                    placeholder="e.g., Computer Science"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year_of_study" className="text-sm font-medium text-gray-700">Current Year of Study</Label>
                  <Select
                    value={profile.year_of_study?.toString() || ""}
                    onValueChange={(value) => handleInputChange("year_of_study", parseInt(value))}
                  >
                    <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                      <SelectItem value="5">5th Year</SelectItem>
                      <SelectItem value="6">6th Year</SelectItem>
                      <SelectItem value="7">7th Year</SelectItem>
                      <SelectItem value="8">8th Year</SelectItem>
                      <SelectItem value="9">9th Year</SelectItem>
                      <SelectItem value="10">10th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="profile-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Address Information</h3>
                  <p className="text-sm text-gray-500">Your current and permanent addresses</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    German Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="india_address" className="text-sm font-medium text-gray-700">Street Address</Label>
                      <Input
                        id="india_address"
                        value={profile.india_address || ""}
                        onChange={(e) => handleInputChange("india_address", e.target.value)}
                        placeholder="123 Main Street"
                        className="input-modern"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="india_city" className="text-sm font-medium text-gray-700">City</Label>
                      <Input
                        id="india_city"
                        value={profile.india_city || ""}
                        onChange={(e) => handleInputChange("india_city", e.target.value)}
                        placeholder="Berlin"
                        className="input-modern"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="india_state" className="text-sm font-medium text-gray-700">State</Label>
                      <Input
                        id="india_state"
                        value={profile.india_state || ""}
                        onChange={(e) => handleInputChange("india_state", e.target.value)}
                        placeholder="Berlin"
                        className="input-modern"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="india_pincode" className="text-sm font-medium text-gray-700">Postal Code</Label>
                      <Input
                        id="india_pincode"
                        value={profile.india_pincode || ""}
                        onChange={(e) => handleInputChange("india_pincode", e.target.value)}
                        placeholder="10115"
                        className="input-modern"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    Ghanaian Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ghana_address" className="text-sm font-medium text-gray-700">Street Address</Label>
                      <Input
                        id="ghana_address"
                        value={profile.ghana_address || ""}
                        onChange={(e) => handleInputChange("ghana_address", e.target.value)}
                        placeholder="123 Main Street"
                        className="input-modern"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ghana_region" className="text-sm font-medium text-gray-700">State/Region</Label>
                      <Input
                        id="ghana_region"
                        value={profile.ghana_region || ""}
                        onChange={(e) => handleInputChange("ghana_region", e.target.value)}
                        placeholder="Accra"
                        className="input-modern"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ghana_city" className="text-sm font-medium text-gray-700">City</Label>
                      <Input
                        id="ghana_city"
                        value={profile.ghana_city || ""}
                        onChange={(e) => handleInputChange("ghana_city", e.target.value)}
                        placeholder="Suyane"
                        className="input-modern"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ghana_pincode" className="text-sm font-medium text-gray-700">Postal Code</Label>
                      <Input
                        id="ghana_pincode"
                        value={profile.ghana_pincode || ""}
                        onChange={(e) => handleInputChange("ghana_pincode", e.target.value)}
                        placeholder="GA-123-4567"
                        className="input-modern"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>



            {/* Emergency Contact */}
            <div className="profile-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Emergency Contact</h3>
                  <p className="text-sm text-gray-500">Emergency contact information</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_name" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input
                    id="emergency_name"
                    value={profile.emergency_contact_name || ""}
                    onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                    placeholder="John Doe"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_relationship" className="text-sm font-medium text-gray-700">Relationship</Label>
                  <Input
                    id="emergency_relationship"
                    value={profile.emergency_contact_relationship || ""}
                    onChange={(e) => handleInputChange("emergency_contact_relationship", e.target.value)}
                    placeholder="Father, Mother, Sibling, etc."
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_number" className="text-sm font-medium text-gray-700">Contact Number</Label>
                  <Input
                    id="emergency_number"
                    value={profile.emergency_contact_number || ""}
                    onChange={(e) => handleInputChange("emergency_contact_number", e.target.value)}
                    placeholder="+233 24 123 4567"
                    className="input-modern"
                  />
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div className="profile-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Document Uploads</h3>
                  <p className="text-sm text-gray-500">Upload your passport and other documents</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="passport" className="text-sm font-medium text-gray-700 mb-2 block">Passport Document</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      id="passport-document"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.size <= 2 * 1024 * 1024) {
                          handleFileUpload(file, 'passport');
                        } else {
                          toast({
                            title: "Error",
                            description: "File size must be less than 2MB",
                            variant: "destructive",
                          });
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('passport-document')?.click()}
                      disabled={uploading}
                      className="border-2 hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Passport
                        </>
                      )}
                    </Button>
                    {profile.passport_document_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(profile.passport_document_url!, '_blank')}
                        className="text-primary hover:text-primary/80"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Document
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF or Image file (max 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="profile-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">About Me</h3>
                  <p className="text-sm text-gray-500">Tell other students about yourself</p>
                </div>
              </div>
              <Textarea
                value={profile.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Write a brief bio about yourself, your interests, goals, etc."
                rows={4}
                className="input-modern resize-none"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="modern-button px-16 py-4 text-lg font-bold shadow-xl flex items-center justify-center min-w-64"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    Update Profile
                  </>
                )}
              </button>
            </div>



            {/* Password Update Section */}
            <div className="profile-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Update Password</h3>
                  <p className="text-sm text-gray-500">Change your account password</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-modern pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-modern pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordUpdate}
                  disabled={updatingPassword || !newPassword || !confirmPassword}
                  className="w-full modern-button"
                >
                  {updatingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}