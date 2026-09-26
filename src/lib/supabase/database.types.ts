// Generated from the live Supabase schema (project: Shortlisted, kewbwypnxwgjoouobjau).
// Regenerate with the Supabase MCP's generate_typescript_types after any schema change.
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          created_at: string
          deadline: string | null
          deanery_region: string | null
          description: string
          estimated_commitment: string | null
          experience_level: string | null
          hospital_trust: string | null
          id: string
          is_remote: boolean
          min_year_of_study: string | null
          poster_id: string
          preferred_skills: string[] | null
          required_skills: string[] | null
          specialty: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          deanery_region?: string | null
          description: string
          estimated_commitment?: string | null
          experience_level?: string | null
          hospital_trust?: string | null
          id?: string
          is_remote?: boolean
          min_year_of_study?: string | null
          poster_id: string
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          specialty?: string | null
          status?: string
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          deanery_region?: string | null
          description?: string
          estimated_commitment?: string | null
          experience_level?: string | null
          hospital_trust?: string | null
          id?: string
          is_remote?: boolean
          min_year_of_study?: string | null
          poster_id?: string
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          specialty?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      opportunity_applications: {
        Row: {
          applicant_id: string
          cover_note: string | null
          created_at: string
          id: string
          opportunity_id: string
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_note?: string | null
          created_at?: string
          id?: string
          opportunity_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_note?: string | null
          created_at?: string
          id?: string
          opportunity_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_bonus_flags: {
        Row: {
          flag_key: string
          flag_value: boolean
          id: string
          specialty: string
          updated_at: string
          user_id: string
        }
        Insert: {
          flag_key: string
          flag_value?: boolean
          id?: string
          specialty: string
          updated_at?: string
          user_id: string
        }
        Update: {
          flag_key?: string
          flag_value?: boolean
          id?: string
          specialty?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_selections: {
        Row: {
          created_at: string
          domain_id: string
          id: string
          points: number
          specialty: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain_id: string
          id?: string
          points: number
          specialty: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain_id?: string
          id?: string
          points?: number
          specialty?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about_experience: string | null
          about_goals: string | null
          about_motivation: string | null
          availability_hours: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_specialty: string | null
          current_specialty_year: string | null
          cv_filename: string | null
          cv_uploaded_at: string | null
          cv_url: string | null
          department: string | null
          email: string | null
          full_name: string | null
          grade: string | null
          hospital_trust: string | null
          id: string
          intent: string | null
          med_school: string | null
          onboarding_completed_at: string | null
          preferred_region: string | null
          qi_experience: string | null
          research_experience: string | null
          role: string | null
          skills: string[] | null
          target_specialty: string | null
          updated_at: string
          year_of_study: string | null
        }
        Insert: {
          about_experience?: string | null
          about_goals?: string | null
          about_motivation?: string | null
          availability_hours?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_specialty?: string | null
          current_specialty_year?: string | null
          cv_filename?: string | null
          cv_uploaded_at?: string | null
          cv_url?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          grade?: string | null
          hospital_trust?: string | null
          id: string
          intent?: string | null
          med_school?: string | null
          onboarding_completed_at?: string | null
          preferred_region?: string | null
          qi_experience?: string | null
          research_experience?: string | null
          role?: string | null
          skills?: string[] | null
          target_specialty?: string | null
          updated_at?: string
          year_of_study?: string | null
        }
        Update: {
          about_experience?: string | null
          about_goals?: string | null
          about_motivation?: string | null
          availability_hours?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_specialty?: string | null
          current_specialty_year?: string | null
          cv_filename?: string | null
          cv_uploaded_at?: string | null
          cv_url?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          grade?: string | null
          hospital_trust?: string | null
          id?: string
          intent?: string | null
          med_school?: string | null
          onboarding_completed_at?: string | null
          preferred_region?: string | null
          qi_experience?: string | null
          research_experience?: string | null
          role?: string | null
          skills?: string[] | null
          target_specialty?: string | null
          updated_at?: string
          year_of_study?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hook_restrict_signup_by_email_domain: {
        Args: { event: Json }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
