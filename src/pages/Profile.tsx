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
import { Camera, Save, User, CheckCircle, Clock, FileText, Upload, Eye, EyeOff, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

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
      console.log("Attribute:",field + " " + value);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="neon-card p-6 text-center pulse-glow">
              <h3 className="text-xl font-semibold gradient-text mb-6 flex items-center justify-center">
                <Camera className="w-5 h-5 mr-2" />
                Profile Photo
              </h3>
              <div className="relative group">
                <Avatar className="w-40 h-40 mx-auto mb-6 border-4 border-purple-200 shadow-lg transition-all duration-300 group-hover:border-purple-400">
                  <AvatarImage src={profile.profile_image_url || ""} alt="Profile" className="object-cover" />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-100 to-pink-100">
                    <User className="w-20 h-20 text-purple-600" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Camera className="w-6 h-6 text-white" />
                </div>
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
                className="neon-button w-full mb-4" 
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
                    Upload New Photo
                  </>
                )}
              </button>
              <p className="text-sm text-muted-foreground">
                JPG, PNG or GIF (max 1MB)
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-3 space-y-8">
            {/* Personal Information */}
            <div className="neon-card p-8">
              <h3 className="text-2xl font-bold gradient-text mb-2">Personal Information</h3>
              <p className="text-muted-foreground mb-6">Your basic personal details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium text-foreground">First Name</Label>
                  <Input
                    id="first_name"
                    value={profile.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className="neon-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium text-foreground">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profile.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className="neon-input"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="india_phone">Phone Number (Germany)</Label>
                  <Input
                    id="india_phone"
                    value={profile.india_phone || ""}
                    onChange={(e) => handleInputChange("india_phone", e.target.value)}
                    placeholder="+49 1512 3456789"
                  />
                </div>
                <div>
                  <Label htmlFor="ghana_mobile_number">Ghana Mobile Number</Label>
                  <Input
                    id="ghana_mobile_number"
                    value={profile.ghana_mobile_number || ""}
                    onChange={(e) => handleInputChange("ghana_mobile_number", e.target.value)}
                    placeholder="+233 24 123 4567"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile.gender || ""}
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="marital_status">Marital Status</Label>
                  {/* <Input
                    id="marital_status"
                    value={profile.marital_status || ""}
                    onChange={(e) => handleInputChange("marital_status", e.target.value)}
                    placeholder="Single, Married, Divorced,..."
                  /> */}
                  <Select
                    value={profile.marital_status || ""}
                    onValueChange={(value) => handleInputChange("marital_status", value)}
                  >
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <DatePicker
                    selected={profile.date_of_birth ? new Date(profile.date_of_birth) : null}
                    onChange={(date: Date | null) => handleInputChange("date_of_birth", date ? date.toISOString().split('T')[0] : null)}
                    dateFormat="yyyy-MM-dd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholderText="Select date of birth"
                    showYearDropdown
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                  <Input
                    id="whatsapp_number"
                    value={profile.whatsapp_number || ""}
                    onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
                    placeholder="+233 24 123 4567"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    value={profile.linkedin_url || ""}
                    onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                 </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="neon-card p-8">
              <h3 className="text-2xl font-bold gradient-text mb-2">Academic Information</h3>
              <p className="text-muted-foreground mb-6">Your educational details in Germany</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="level_of_study">Level of Study</Label>
                  <Select
                    value={profile.level_of_study || ""}
                    onValueChange={(value) => handleInputChange("level_of_study", value)}
                  >
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="year_of_enrollment">Year of Enrollment</Label>
                  <Input
                    id="year_of_enrollment"
                    type="number"
                    value={profile.year_of_enrollment || ""}
                    onChange={(e) => handleInputChange("year_of_enrollment", parseInt(e.target.value))}
                    placeholder="2020"
                  />
                </div>
                <div>
                  <Label htmlFor="expected_completion_year">Expected Completion Year</Label>
                  <Input
                    id="expected_completion_year"
                    type="number"
                    value={profile.expected_completion_year || ""}
                    onChange={(e) => handleInputChange("expected_completion_year", parseInt(e.target.value))}
                    placeholder="2024"
                  />
                </div>
                <div>
                  <Label htmlFor="university">University/Institution</Label>
                  <Input
                    id="university"
                    value={profile.university || ""}
                    onChange={(e) => handleInputChange("university", e.target.value)}
                    placeholder="e.g., Humboldt University of Berlin"
                  />
                </div>
                <div>
                  <Label htmlFor="major">Major/Course</Label>
                  <Input
                    id="major"
                    value={profile.major || ""}
                    onChange={(e) => handleInputChange("major", e.target.value)}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <Label htmlFor="year_of_study">Current Year of Study</Label>
                  <Select
                    value={profile.year_of_study?.toString() || ""}
                    onValueChange={(value) => handleInputChange("year_of_study", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                      <SelectItem value="5">5th Year</SelectItem>
                      <SelectItem value="6">6th Year</SelectItem>
                      <SelectItem value="6">7th Year</SelectItem>
                      <SelectItem value="6">8th Year</SelectItem>
                      <SelectItem value="6">9th Year</SelectItem>
                      <SelectItem value="6">10th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold gradient-text mb-2">Address Information</CardTitle>
                <CardDescription>Your current and permanent addresses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">German Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="india_address">Street Address</Label>
                      <Input
                        id="india_address"
                        value={profile.india_address || ""}
                        onChange={(e) => handleInputChange("india_address", e.target.value)}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <Label htmlFor="india_city">City</Label>
                      <Input
                        id="india_city"
                        value={profile.india_city || ""}
                        onChange={(e) => handleInputChange("india_city", e.target.value)}
                        placeholder="Berlin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="india_state">State</Label>
                      <Input
                        id="india_state"
                        value={profile.india_state || ""}
                        onChange={(e) => handleInputChange("india_state", e.target.value)}
                        placeholder="Berlin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="india_pincode">Postal Code</Label>
                      <Input
                        id="india_pincode"
                        value={profile.india_pincode || ""}
                        onChange={(e) => handleInputChange("india_pincode", e.target.value)}
                        placeholder="10115"
                      />
                    </div>
                  </div>
                </div>

                {/* <div className="flex items-center space-x-2">
                  <Checkbox
                    id="same_address"
                    checked={profile.same_as_current_address || false}
                    onCheckedChange={(checked) => handleInputChange("same_as_current_address", checked)}
                  />
                  <Label htmlFor="same_address">Same as current address</Label>
                </div> */}

                {/* {!profile.same_as_current_address && ( */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Ghanaian Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ghana_address">Street Address</Label>
                        <Input
                          id="ghana_address"
                          value={profile.ghana_address || ""}
                          onChange={(e) => handleInputChange("ghana_address", e.target.value)}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ghana_region">State/Region</Label>
                        <Input
                          id="ghana_region"
                          value={profile.ghana_region || ""}
                          onChange={(e) => handleInputChange("ghana_region", e.target.value)}
                          placeholder="Accra"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ghana_city">City</Label>
                        <Input
                          id="ghana_city"
                          value={profile.ghana_city || ""}
                          onChange={(e) => handleInputChange("ghana_city", e.target.value)}
                          placeholder="Suyane"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ghana_pincode">Postal Code</Label>
                        <Input
                          id="ghana_pincode"
                          value={profile.ghana_pincode || ""}
                          onChange={(e) => handleInputChange("ghana_pincode", e.target.value)}
                          placeholder="GA-123-4567"
                        />
                      </div>
                    </div>
                  </div>
                {/* )} */}
              </CardContent>
            </Card>

          

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold gradient-text mb-2">Emergency Contact</CardTitle>
                <CardDescription>Emergency contact information</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergency_name">Full Name</Label>
                  <Input
                    id="emergency_name"
                    value={profile.emergency_contact_name || ""}
                    onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_relationship">Relationship</Label>
                  <Input
                    id="emergency_relationship"
                    value={profile.emergency_contact_relationship || ""}
                    onChange={(e) => handleInputChange("emergency_contact_relationship", e.target.value)}
                    placeholder="Father, Mother, Sibling, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_number">Contact Number</Label>
                  <Input
                    id="emergency_number"
                    value={profile.emergency_contact_number || ""}
                    onChange={(e) => handleInputChange("emergency_contact_number", e.target.value)}
                    placeholder="+233 24 123 4567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Document Uploads */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold gradient-text mb-2">Document Uploads</CardTitle>
                <CardDescription>Upload your passport and other documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="passport">Passport Document</Label>
                  <div className="flex items-center gap-4 mt-2">
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
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Document
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF or Image file (max 2MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Bio Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold gradient-text mb-2">About Me</CardTitle>
                <CardDescription>Tell other students about yourself</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={profile.bio || ""}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Write a brief bio about yourself, your interests, goals, etc."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-center">
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="neon-button px-12 py-4 text-lg font-semibold min-w-48"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" /> Update Profile
                  </>
                )}
              </button>
            </div>

                
            
            {/* Add Password Update Section */}
            <div className="neon-card p-6">
              <h3 className="text-xl font-semibold gradient-text mb-6 flex items-center justify-center">
                <Key className="w-5 h-5 mr-2" />
                Update Password
              </h3>
              
              <div className="space-y-4">
                
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="neon-input pr-10"
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
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="neon-input pr-10"
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
                  disabled={updatingPassword  || !newPassword || !confirmPassword}
                  className="w-full neon-button"
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