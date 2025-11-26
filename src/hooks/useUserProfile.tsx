import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "admin" | null;
  is_verified: boolean | null;
  is_profile_complete: boolean | null; // Missing in your interface
  phone?: string | null;
  profile_image_url?: string | null;
  university?: string | null;
  major?: string | null;
  current_city?: string | null;
  current_state?: string | null;
  hometown?: string | null;
  ghana_address?: string | null; // Missing in your interface
  ghana_city?: string | null; // Missing in your interface
  ghana_region?: string | null;
  ghana_pincode?: string | null; // Missing in your interface
  linkedin_url?: string | null;
  whatsapp_number?: string | null;
  bio?: string | null;
  // school_name?: string | null; // Remove - not in SQL schema
  germany_phone?: string | null;
  germany_state?: string | null;
  germany_city?: string | null;
  germany_address?: string | null; // Missing in your interface
  germany_pincode?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  ghana_mobile_number?: string | null;
  level_of_study?: string | null;
  year_of_enrollment?: number | null; // Missing in your interface
  expected_completion_year?: number | null; // Missing in your interface
  year_of_study?: number | null;
  graduation_year?: number | null;
  date_of_birth?: string | null;
  current_address_street?: string | null;
  current_address_city?: string | null;
  current_address_state?: string | null;
  current_address_postal_code?: string | null;
  permanent_address_street?: string | null;
  permanent_address_city?: string | null;
  permanent_address_state?: string | null;
  permanent_address_postal_code?: string | null;
  same_as_current_address?: boolean | null;
  emergency_contact_name?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_number?: string | null;
  passport_document_url?: string | null;
  created_at?: string | null; // Missing in your interface
  updated_at?: string | null; // Missing in your interface
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
      setError(null);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        
        // If profile doesn't exist, create a basic one
        if (error.code === 'PGRST116') { // No rows returned
          await createBasicProfile();
          return;
        }
        
        setError(error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createBasicProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || "User",
          last_name: user.user_metadata?.last_name || "Name",
          role: "student",
          is_verified: false,
          is_profile_complete: false
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating profile:", error);
        setError("Failed to create profile");
      } else {
        setProfile(data);
        console.log("Basic profile created successfully");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      setError("Failed to create profile");
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      } else {
        setProfile(data);
        return data;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return { 
    profile, 
    isLoading, 
    error,
    refetch: fetchProfile, 
    updateProfile 
  };
}