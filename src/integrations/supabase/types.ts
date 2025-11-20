export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_approvals: {
        Row: {
          admin_notes: string | null
          applicant_id: string
          application_reason: string
          approved_by: string | null
          created_at: string
          id: string
          reviewed_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          applicant_id: string
          application_reason: string
          approved_by?: string | null
          created_at?: string
          id?: string
          reviewed_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          applicant_id?: string
          application_reason?: string
          approved_by?: string | null
          created_at?: string
          id?: string
          reviewed_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_approvals_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          author_id: string
          category: Database["public"]["Enums"]["announcement_category"]
          content: string
          created_at: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          category: Database["public"]["Enums"]["announcement_category"]
          content: string
          created_at?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          category?: Database["public"]["Enums"]["announcement_category"]
          content?: string
          created_at?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assistance_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          request_type: string
          resolved_at: string | null
          reviewed_by: string | null
          status: string
          student_id: string
          title: string
          updated_at: string
          urgency_level: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          request_type: string
          resolved_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_id: string
          title: string
          updated_at?: string
          urgency_level?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          request_type?: string
          resolved_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_id?: string
          title?: string
          updated_at?: string
          urgency_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistance_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistance_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      board_members: {
        Row: {
          academic_background: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          leadership_experience: string | null
          name: string
          order_priority: number | null
          position: string
          quote: string | null
          updated_at: string
          year: string | null
        }
        Insert: {
          academic_background?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          leadership_experience?: string | null
          name: string
          order_priority?: number | null
          position: string
          quote?: string | null
          updated_at?: string
          year?: string | null
        }
        Update: {
          academic_background?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          leadership_experience?: string | null
          name?: string
          order_priority?: number | null
          position?: string
          quote?: string | null
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      constitution_documents: {
        Row: {
          created_at: string
          file_url: string
          id: string
          is_current: boolean | null
          title: string
          updated_at: string
          uploaded_by: string | null
          version: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          is_current?: boolean | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          version: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          is_current?: boolean | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "constitution_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_inquiries: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["inquiry_status"] | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_inquiries_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      hero_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          order_priority: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          order_priority?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          order_priority?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_milestones: {
        Row: {
          created_at: string
          date_achieved: string
          description: string | null
          id: string
          is_featured: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_achieved: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_achieved?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          current_address_city: string | null
          current_address_postal_code: string | null
          current_address_state: string | null
          current_address_street: string | null
          current_city: string | null
          current_state: string | null
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_number: string | null
          emergency_contact_relationship: string | null
          expected_completion_year: number | null
          first_name: string
          gender: string | null
          ghana_mobile_number: string | null
          ghana_region: string | null
          graduation_year: number | null
          hometown: string | null
          id: string
          india_city: string | null
          india_phone: string | null
          india_pincode: string | null
          india_state: string | null
          is_profile_complete: boolean | null
          is_verified: boolean | null
          last_name: string
          level_of_study: string | null
          linkedin_url: string | null
          major: string | null
          marital_status: string | null
          passport_document_url: string | null
          permanent_address_city: string | null
          permanent_address_postal_code: string | null
          permanent_address_state: string | null
          permanent_address_street: string | null
          phone: string | null
          profile_image_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          same_as_current_address: boolean | null
          school_name: string | null
          university: string | null
          updated_at: string | null
          whatsapp_number: string | null
          year_of_enrollment: number | null
          year_of_study: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          current_address_city?: string | null
          current_address_postal_code?: string | null
          current_address_state?: string | null
          current_address_street?: string | null
          current_city?: string | null
          current_state?: string | null
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          emergency_contact_relationship?: string | null
          expected_completion_year?: number | null
          first_name: string
          gender?: string | null
          ghana_mobile_number?: string | null
          ghana_region?: string | null
          graduation_year?: number | null
          hometown?: string | null
          id: string
          india_city?: string | null
          india_phone?: string | null
          india_pincode?: string | null
          india_state?: string | null
          is_profile_complete?: boolean | null
          is_verified?: boolean | null
          last_name: string
          level_of_study?: string | null
          linkedin_url?: string | null
          major?: string | null
          marital_status?: string | null
          passport_document_url?: string | null
          permanent_address_city?: string | null
          permanent_address_postal_code?: string | null
          permanent_address_state?: string | null
          permanent_address_street?: string | null
          phone?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          same_as_current_address?: boolean | null
          school_name?: string | null
          university?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
          year_of_enrollment?: number | null
          year_of_study?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          current_address_city?: string | null
          current_address_postal_code?: string | null
          current_address_state?: string | null
          current_address_street?: string | null
          current_city?: string | null
          current_state?: string | null
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          emergency_contact_relationship?: string | null
          expected_completion_year?: number | null
          first_name?: string
          gender?: string | null
          ghana_mobile_number?: string | null
          ghana_region?: string | null
          graduation_year?: number | null
          hometown?: string | null
          id?: string
          india_city?: string | null
          india_phone?: string | null
          india_pincode?: string | null
          india_state?: string | null
          is_profile_complete?: boolean | null
          is_verified?: boolean | null
          last_name?: string
          level_of_study?: string | null
          linkedin_url?: string | null
          major?: string | null
          marital_status?: string | null
          passport_document_url?: string | null
          permanent_address_city?: string | null
          permanent_address_postal_code?: string | null
          permanent_address_state?: string | null
          permanent_address_street?: string | null
          phone?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          same_as_current_address?: boolean | null
          school_name?: string | null
          university?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
          year_of_enrollment?: number | null
          year_of_study?: number | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          active: boolean | null
          bank_details: Json | null
          created_at: string | null
          description: string | null
          donation_link: string | null
          featured: boolean | null
          id: string
          logo_url: string | null
          mobile_money_details: Json | null
          name: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          active?: boolean | null
          bank_details?: Json | null
          created_at?: string | null
          description?: string | null
          donation_link?: string | null
          featured?: boolean | null
          id?: string
          logo_url?: string | null
          mobile_money_details?: Json | null
          name: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          active?: boolean | null
          bank_details?: Json | null
          created_at?: string | null
          description?: string | null
          donation_link?: string | null
          featured?: boolean | null
          id?: string
          logo_url?: string | null
          mobile_money_details?: Json | null
          name?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      announcement_category:
        | "scholarships"
        | "jobs"
        | "sports"
        | "events"
        | "general"
      inquiry_status: "pending" | "in_progress" | "resolved"
      user_role: "student" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      announcement_category: [
        "scholarships",
        "jobs",
        "sports",
        "events",
        "general",
      ],
      inquiry_status: ["pending", "in_progress", "resolved"],
      user_role: ["student", "admin"],
    },
  },
} as const
