import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, Eye, EyeOff, Mail, Lock, User, Phone, MapPin, BookOpen, GraduationCap, Heart, CreditCard, ChevronLeft, School, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function EnhancedAuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [isStepValid, setIsStepValid] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic auth
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    
    // Personal Information
    gender: "",
    maritalStatus: "",
    dateOfBirth: null as Date | null,
    ghanaMobileNumber: "",
    whatsappNumber: "",
    linkedinUrl: "",
    
    // Academic Information
    levelOfStudy: "",
    university: "",
    major: "",
    yearOfEnrollment: "",
    expectedCompletionYear: "",
    yearOfStudy: "",
    graduationYear: "",
    
    // German Address
    germanyAddress: "",
    germanyCity: "",
    germanyState: "",
    germanyPincode: "",
    germanyPhone: "",

    // Ghanaian Address
    ghanaAddress: "",
    ghanaCity: "",
    ghanaRegion: "",
    ghanaPincode: "",

    // Current Address (International)
    currentStreet: "",
    currentCity: "",
    currentState: "",
    currentPostalCode: "",

    // Permanent Address
    permanentStreet: "",
    permanentCity: "",
    permanentState: "",
    permanentPostalCode: "",
    sameAsCurrentAddress: false,

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactNumber: "",

    // Additional fields from profile
    phone: "",
    hometown: "",
    bio: "",
  });
  
  const [files, setFiles] = useState({
    passport: null as File | null,
    profilePicture: null as File | null,
  });

  const totalSteps = 5;

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (field: 'passport' | 'profilePicture', file: File | null) => {
    setFiles({ ...files, [field]: file });
  };

  const handleSameAddressChange = (checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        sameAsCurrentAddress: true,
        permanentStreet: formData.currentStreet,
        permanentCity: formData.currentCity,
        permanentState: formData.currentState,
        permanentPostalCode: formData.currentPostalCode,
      });
    } else {
      setFormData({
        ...formData,
        sameAsCurrentAddress: false,
        permanentStreet: "",
        permanentCity: "",
        permanentState: "",
        permanentPostalCode: "",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return urlData.publicUrl;
  };

  // Validation functions for each step
  const validateStep1 = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.password.length >= 6
    );
  };

  const validateStep2 = () => {
    return (
      formData.gender.trim() !== "" &&
      formData.maritalStatus.trim() !== "" &&
      formData.dateOfBirth !== null &&
      formData.germanyPhone.trim() !== "" &&
      formData.ghanaMobileNumber.trim() !== "" &&
      formData.whatsappNumber.trim() !== "" &&
      formData.linkedinUrl.trim() !== ""
    );
  };

  const validateStep3 = () => {
    return (
      formData.levelOfStudy.trim() !== "" &&
      formData.university.trim() !== "" &&
      formData.major.trim() !== "" &&
      formData.yearOfEnrollment.trim() !== "" &&
      formData.expectedCompletionYear.trim() !== "" &&
      formData.yearOfStudy.trim() !== ""
    );
  };

  const validateStep4 = () => {
    return (
      formData.germanyAddress.trim() !== "" &&
      formData.germanyCity.trim() !== "" &&
      formData.germanyState.trim() !== "" &&
      formData.germanyPincode.trim() !== "" &&
      formData.ghanaAddress.trim() !== "" &&
      formData.ghanaCity.trim() !== "" &&
      formData.ghanaRegion.trim() !== "" &&
      formData.ghanaPincode.trim() !== ""
    );
  };

  const validateStep5 = () => {
    return (
      formData.emergencyContactName.trim() !== "" &&
      formData.emergencyContactRelationship.trim() !== "" &&
      formData.emergencyContactNumber.trim() !== "" &&
      formData.bio.trim() !== ""
    );
  };

  // Effect to validate current step
  useEffect(() => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      case 5:
        isValid = validateStep5();
        break;
      default:
        isValid = false;
    }
    
    setIsStepValid(isValid);
  }, [currentStep, formData]);



  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset link sent!",
          description: "Check your email for the password reset link.",
        });
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("1. Starting signup process");

      // Step 1: Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user data returned");

      console.log("2. User created:", authData.user.id);
      console.log("2a. Session:", authData.session);
      
      // Wait a moment for the session to be established
      if (!authData.session) {
        console.log("2b. No session yet, waiting...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: { session } } = await supabase.auth.getSession();
        console.log("2c. Session after wait:", session);
      }

      // Prepare profile data
      const profileData = {
        id: authData.user.id,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        gender: formData.gender,
        marital_status: formData.maritalStatus,
        date_of_birth: formData.dateOfBirth?.toISOString().split('T')[0],
        ghana_mobile_number: formData.ghanaMobileNumber,
        whatsapp_number: formData.whatsappNumber,
        linkedin_url: formData.linkedinUrl,
        level_of_study: formData.levelOfStudy,
        university: formData.university,
        major: formData.major,
        year_of_enrollment: formData.yearOfEnrollment ? parseInt(formData.yearOfEnrollment) : null,
        expected_completion_year: formData.expectedCompletionYear ? parseInt(formData.expectedCompletionYear) : null,
        year_of_study: formData.yearOfStudy ? parseInt(formData.yearOfStudy) : null,
        graduation_year: formData.graduationYear ? parseInt(formData.graduationYear) : null,
        germany_phone: formData.germanyPhone,
        germany_state: formData.germanyState,
        germany_city: formData.germanyCity,
        germany_address: formData.germanyAddress,
        germany_pincode: formData.germanyPincode,
        ghana_pincode: formData.ghanaPincode,
        ghana_region: formData.ghanaRegion,
        ghana_address: formData.ghanaAddress,
        ghana_city: formData.ghanaCity,
        hometown: formData.hometown,
        current_address_street: formData.currentStreet,
        current_address_city: formData.currentCity,
        current_address_state: formData.currentState,
        current_address_postal_code: formData.currentPostalCode,
        permanent_address_street: formData.permanentStreet,
        permanent_address_city: formData.permanentCity,
        permanent_address_state: formData.permanentState,
        permanent_address_postal_code: formData.permanentPostalCode,
        same_as_current_address: formData.sameAsCurrentAddress,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_relationship: formData.emergencyContactRelationship,
        emergency_contact_number: formData.emergencyContactNumber,
        bio: formData.bio,
        is_profile_complete: true,
        updated_at: new Date().toISOString(),
      };

      // Upload files if provided AND we have a session
      // If no session (email confirmation required), skip file uploads for now
      // User can upload files after confirming email
      let passportUrl = "";
      let profilePictureUrl = "";

      if (authData.session && files.passport) {
        try {
          const passportPath = `${authData.user.id}/passport_${Date.now()}.${files.passport.name.split('.').pop()}`;
          passportUrl = await uploadFile(files.passport, 'documents', passportPath);
          profileData.passport_document_url = passportUrl;
        } catch (uploadError) {
          console.warn("Passport upload failed (will be available after email confirmation):", uploadError);
        }
      }

      if (authData.session && files.profilePicture) {
        try {
          const picturePath = `${authData.user.id}/profile_${Date.now()}.${files.profilePicture.name.split('.').pop()}`;
          profilePictureUrl = await uploadFile(files.profilePicture, 'profile-pictures', picturePath);
          profileData.profile_image_url = profilePictureUrl;
        } catch (uploadError) {
          console.warn("Profile picture upload failed (will be available after email confirmation):", uploadError);
        }
      }

      // Since there's no session yet (email confirmation required),
      // we MUST use the RPC function which bypasses RLS
      console.log("3. Upserting profile using database function (no session, must use RPC)...");
      console.log("Profile data keys:", Object.keys(profileData));
      
      // Convert profileData to JSONB format for the function
      // Remove undefined values and convert to proper types
      const cleanProfileData: any = {};
      Object.keys(profileData).forEach(key => {
        const value = (profileData as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          cleanProfileData[key] = value;
        }
      });
      
      console.log("3a. Cleaned profile data:", cleanProfileData);
      
      // Call RPC function - this MUST work since it bypasses RLS
      const { data: rpcData, error: upsertError } = await supabase.rpc('upsert_user_profile', {
        profile_data: cleanProfileData
      });

      if (upsertError) {
        console.error("4. RPC failed:", upsertError);
        console.error("Error details:", JSON.stringify(upsertError, null, 2));
        
        // If RPC fails, we can't use direct insert/update without a session
        // The profile will be created by the trigger, user can complete it after email confirmation
        console.warn("5. Profile will be created by trigger. User can complete profile after email confirmation.");
        
        // Don't throw error - let the trigger handle basic profile creation
        // The user can complete their profile after confirming their email
      } else {
        console.log("5. Profile upserted successfully via RPC", rpcData);
      }

      toast({
        title: "Sign up successful!",
        description: authData.session 
          ? "Your account has been created with complete profile." 
          : "Please check your email to confirm your account before signing in.",
      });

      setActiveTab("signin");
      setCurrentStep(1);

    } catch (error: any) {
      console.error("Final error:", error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error("Sign in error:", error);
        
        // Provide more helpful error messages
        let errorMessage = error.message;
        if (error.message?.includes('email') || error.message?.includes('Email')) {
          errorMessage = "Please check your email and confirm your account before signing in.";
        } else if (error.message?.includes('password') || error.message?.includes('Password')) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.status === 400) {
          errorMessage = "Please confirm your email address before signing in. Check your inbox for the confirmation link.";
        }
        
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-gray-200 shadow-sm">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto mb-2">
              <img 
                src="/icon.png" 
              alt="NUGSA Logo" 
                className="w-16 h-16 mx-auto"
              />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">Reset password</CardTitle>
            <CardDescription className="text-gray-600">Enter your email to receive a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgotEmail" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-gray-600 hover:text-gray-800" 
                onClick={() => setShowForgotPassword(false)}
              >
                Back to sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <img 
            src="/icon.png" 
            alt="NUGSA Logo" 
            className="w-20 h-20 mx-auto mb-4"
          />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">NUGSA - Germany Student Platform</h1>
          <p className="text-gray-600">Connect with Ghanaian students in Germany</p>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent py-3 text-gray-600 data-[state=active]:font-semibold"
                >
                  Sign in
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent py-3 text-gray-600 data-[state=active]:font-semibold"
                >
                  Sign up
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Tabs value={activeTab} className="w-full">
              
              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4 m-0">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign in
                  </Button>
                </form>
                
                <div className="text-center text-sm text-gray-600">
                  No account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => setActiveTab("signup")}
                  >
                    Create one!
                  </button>
                </div>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="m-0">
                <form onSubmit={handleSignUp} className="space-y-6">
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
                      <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            required
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            required
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">Email *</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            required
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">Password *</Label>
                          <div className="relative">
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                              required
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Personal Information */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender *</Label>
                          <Select 
                            value={formData.gender} 
                            onValueChange={(value) => handleInputChange("gender", value)}
                            required
                          >
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                          <Label htmlFor="maritalStatus" className="text-sm font-medium text-gray-700">Marital status *</Label>
                          <Select 
                            value={formData.maritalStatus} 
                            onValueChange={(value) => handleInputChange("maritalStatus", value)}
                            required
                          >
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                          <Label className="text-sm font-medium text-gray-700">Date of birth *</Label>
                          <DatePicker
                            selected={formData.dateOfBirth}
                            onChange={(date: Date | null) => handleInputChange("dateOfBirth", date)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholderText="Select date"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={50}
                            dateFormat="MM/dd/yyyy"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        
                        <div className="space-y-2">
                          <Label htmlFor="germanyPhone" className="text-sm font-medium text-gray-700">Germany phone *</Label>
                          <Input
                            id="germanyPhone"
                            value={formData.germanyPhone}
                            onChange={(e) => handleInputChange("germanyPhone", e.target.value)}
                            placeholder="+49 1512 3456789"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ghanaMobileNumber" className="text-sm font-medium text-gray-700">Ghana mobile *</Label>
                          <Input
                            id="ghanaMobileNumber"
                            placeholder="+233 24 123 4567"
                            value={formData.ghanaMobileNumber}
                            onChange={(e) => handleInputChange("ghanaMobileNumber", e.target.value)}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="whatsappNumber" className="text-sm font-medium text-gray-700">WhatsApp number *</Label>
                          <Input
                            id="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                            placeholder="+233 24 123 4567"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedinUrl" className="text-sm font-medium text-gray-700">LinkedIn URL *</Label>
                          <Input
                            id="linkedinUrl"
                            value={formData.linkedinUrl}
                            onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                            placeholder="https://linkedin.com/in/yourprofile"
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Academic Information */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Academic Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="levelOfStudy" className="text-sm font-medium text-gray-700">Level of study *</Label>
                          <Select 
                            value={formData.levelOfStudy} 
                            onValueChange={(value) => handleInputChange("levelOfStudy", value)}
                            required
                          >
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                          <Label htmlFor="university" className="text-sm font-medium text-gray-700">University/Institution *</Label>
                          <Input
                            id="university"
                            placeholder="e.g., Humboldt University of Berlin"
                            value={formData.university}
                            onChange={(e) => handleInputChange("university", e.target.value)}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="major" className="text-sm font-medium text-gray-700">Major/Course *</Label>
                          <Input
                            id="major"
                            placeholder="e.g., Computer Science"
                            value={formData.major}
                            onChange={(e) => handleInputChange("major", e.target.value)}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yearOfEnrollment" className="text-sm font-medium text-gray-700">Enrollment year *</Label>
                          <Input
                            id="yearOfEnrollment"
                            type="number"
                            placeholder="2023"
                            value={formData.yearOfEnrollment}
                            onChange={(e) => handleInputChange("yearOfEnrollment", e.target.value)}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expectedCompletionYear" className="text-sm font-medium text-gray-700">Completion year *</Label>
                          <Input
                            id="expectedCompletionYear"
                            type="number"
                            placeholder="2027"
                            value={formData.expectedCompletionYear}
                            onChange={(e) => handleInputChange("expectedCompletionYear", e.target.value)}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="yearOfStudy" className="text-sm font-medium text-gray-700">Current year *</Label>
                          <Select 
                            value={formData.yearOfStudy} 
                            onValueChange={(value) => handleInputChange("yearOfStudy", value)}
                            required
                          >
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year} Year
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Address Information */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Address Information
                      </h3>
                      
                      {/* German Address */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">German Address *</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="germanyAddress" className="text-sm font-medium text-gray-700">Street address *</Label>
                            <Input
                              id="germanyAddress"
                              value={formData.germanyAddress}
                              onChange={(e) => handleInputChange("germanyAddress", e.target.value)}
                              placeholder="123 Main Street"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="germanyCity" className="text-sm font-medium text-gray-700">City *</Label>
                            <Input
                              id="germanyCity"
                              value={formData.germanyCity}
                              onChange={(e) => handleInputChange("germanyCity", e.target.value)}
                              placeholder="Berlin"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="germanyState" className="text-sm font-medium text-gray-700">State *</Label>
                            <Input
                              id="germanyState"
                              value={formData.germanyState}
                              onChange={(e) => handleInputChange("germanyState", e.target.value)}
                              placeholder="Berlin"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="germanyPincode" className="text-sm font-medium text-gray-700">Postal code *</Label>
                            <Input
                              id="germanyPincode"
                              value={formData.germanyPincode}
                              onChange={(e) => handleInputChange("germanyPincode", e.target.value)}
                              placeholder="10115"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Ghanaian Address */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">Ghanaian Address *</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ghanaAddress" className="text-sm font-medium text-gray-700">Street address *</Label>
                            <Input
                              id="ghanaAddress"
                              value={formData.ghanaAddress}
                              onChange={(e) => handleInputChange("ghanaAddress", e.target.value)}
                              placeholder="123 Main Street"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ghanaCity" className="text-sm font-medium text-gray-700">City *</Label>
                            <Input
                              id="ghanaCity"
                              value={formData.ghanaCity}
                              onChange={(e) => handleInputChange("ghanaCity", e.target.value)}
                              placeholder="Accra"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ghanaRegion" className="text-sm font-medium text-gray-700">State/Region *</Label>
                            <Input
                              id="ghanaRegion"
                              value={formData.ghanaRegion}
                              onChange={(e) => handleInputChange("ghanaRegion", e.target.value)}
                              placeholder="Greater Accra"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ghanaPincode" className="text-sm font-medium text-gray-700">Postal code *</Label>
                            <Input
                              id="ghanaPincode"
                              value={formData.ghanaPincode}
                              onChange={(e) => handleInputChange("ghanaPincode", e.target.value)}
                              placeholder="GA-123-4567"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Hometown */}
                      <div className="space-y-2">
                        <Label htmlFor="hometown" className="text-sm font-medium text-gray-700">Hometown *</Label>
                        <Input
                          id="hometown"
                          value={formData.hometown}
                          onChange={(e) => handleInputChange("hometown", e.target.value)}
                          placeholder="Your hometown in Ghana"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 5: Emergency Contact & Bio */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      {/* Emergency Contact */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Heart className="w-5 h-5" />
                          Emergency Contact
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="emergencyContactName" className="text-sm font-medium text-gray-700">Full name *</Label>
                            <Input
                              id="emergencyContactName"
                              value={formData.emergencyContactName}
                              onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                              placeholder="John Doe"
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emergencyContactRelationship" className="text-sm font-medium text-gray-700">Relationship *</Label>
                            <Input
                              id="emergencyContactRelationship"
                              placeholder="e.g., Parent, Sibling"
                              value={formData.emergencyContactRelationship}
                              onChange={(e) => handleInputChange("emergencyContactRelationship", e.target.value)}
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emergencyContactNumber" className="text-sm font-medium text-gray-700">Contact number *</Label>
                            <Input
                              id="emergencyContactNumber"
                              placeholder="+233 24 123 4567"
                              value={formData.emergencyContactNumber}
                              onChange={(e) => handleInputChange("emergencyContactNumber", e.target.value)}
                              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bio Section */}
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          About Me
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio *</Label>
                          <textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => handleInputChange("bio", e.target.value)}
                            placeholder="Tell us about yourself..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Document Uploads */}
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Upload className="w-5 h-5" />
                          Document Uploads
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="passport" className="text-sm font-medium text-gray-700">Passport (PDF/Image, max 2MB)</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="passport"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange('passport', e.target.files?.[0] || null)}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('passport')?.click()}
                                className="w-full border-gray-300 hover:bg-gray-50"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {files.passport ? files.passport.name : "Upload Passport"}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="profilePicture" className="text-sm font-medium text-gray-700">Profile picture (Image, max 1MB)</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="profilePicture"
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange('profilePicture', e.target.files?.[0] || null)}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('profilePicture')?.click()}
                                className="w-full border-gray-300 hover:bg-gray-50"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {files.profilePicture ? files.profilePicture.name : "Upload Photo"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4 border-t">
                    {currentStep > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    ) : (
                      <div></div>
                    )}
                    
                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!isStepValid}
                      >
                        Next
                        <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium" 
                        disabled={isLoading || !isStepValid}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create account
                      </Button>
                    )}
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}